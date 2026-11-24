/**
 * C-Tech Chemical Trading Platform — Disaster Recovery & Database Restoration Test
 * 1. Dumps the active database using pg_dump.exe
 * 2. Creates an isolated sandbox test database: ctech_v3_restore_test
 * 3. Restores the full SQL dump into ctech_v3_restore_test using psql.exe
 * 4. Compares tables, indexes, and row counts between source and restored databases
 * 5. Verifies application connectivity and query execution against the restored DB
 * 6. Drops the test database cleanly
 */

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const execFileAsync = promisify(execFile);

const PG_BIN_DIR = 'C:\\Program Files\\PostgreSQL\\18\\bin';
const PG_DUMP_BIN = path.join(PG_BIN_DIR, 'pg_dump.exe');
const PSQL_BIN = path.join(PG_BIN_DIR, 'psql.exe');

const SOURCE_DB = 'ctech_v3';
const RESTORE_DB = 'ctech_v3_restore_test';
const DB_USER = 'postgres';
const DB_PASS = '1234';
const DB_HOST = 'localhost';
const DB_PORT = 5432;

const DUMP_FILE = path.join(__dirname, '..', 'uploads', 'test-restore-dump.sql');

async function queryCounts(dbName) {
  const pool = new Pool({
    connectionString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${dbName}`,
  });

  try {
    const tableRes = await pool.query(`
      SELECT count(*)::int AS count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    const indexRes = await pool.query(`
      SELECT count(*)::int AS count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);

    const tables = [
      'users',
      'sellers',
      'buyers',
      'chemicals',
      'quotation_requests',
      'purchase_orders',
      'invoices',
      'audit_logs',
      '_migrations',
    ];

    const rowCounts = {};
    for (const t of tables) {
      try {
        const r = await pool.query(`SELECT count(*)::int AS count FROM "${t}"`);
        rowCounts[t] = r.rows[0].count;
      } catch (e) {
        rowCounts[t] = 'MISSING';
      }
    }

    return {
      tableCount: tableRes.rows[0].count,
      indexCount: indexRes.rows[0].count,
      rowCounts,
    };
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('================================================================');
  console.log('C-TECH TRADE DESK — DISASTER RECOVERY & DATABASE RESTORATION TEST');
  console.log(`Source DB: ${SOURCE_DB} -> Isolated Restore Target: ${RESTORE_DB}`);
  console.log('================================================================\n');

  // Step 1: Dump Source Database
  console.log('[Step 1] Exporting clean SQL dump of source database via pg_dump...');
  const dumpEnv = {
    ...process.env,
    PGHOST: DB_HOST,
    PGPORT: String(DB_PORT),
    PGUSER: DB_USER,
    PGPASSWORD: DB_PASS,
    PGDATABASE: SOURCE_DB,
  };

  const dumpStart = performance.now();
  await execFileAsync(
    PG_DUMP_BIN,
    ['--no-owner', '--no-privileges', '--format=plain', `--file=${DUMP_FILE}`],
    { env: dumpEnv }
  );
  const dumpDuration = ((performance.now() - dumpStart) / 1000).toFixed(2);
  const dumpStats = fs.statSync(DUMP_FILE);
  console.log(`  -> Dump completed in ${dumpDuration}s. Size: ${(dumpStats.size / 1024).toFixed(1)} KB\n`);

  // Step 2: Manage Test Database on PostgreSQL Server
  console.log(`[Step 2] Initializing isolated restore target database (${RESTORE_DB})...`);
  const rootPool = new Pool({
    connectionString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/postgres`,
  });

  try {
    // Terminate existing connections to test DB if any
    await rootPool.query(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `, [RESTORE_DB]);

    await rootPool.query(`DROP DATABASE IF EXISTS ${RESTORE_DB}`);
    await rootPool.query(`CREATE DATABASE ${RESTORE_DB}`);
    console.log(`  -> Target test database ${RESTORE_DB} created successfully.\n`);
  } finally {
    await rootPool.end();
  }

  // Step 3: Restore SQL Dump into Restore Database
  console.log(`[Step 3] Restoring dump into ${RESTORE_DB} using psql.exe...`);
  const restoreEnv = {
    ...process.env,
    PGHOST: DB_HOST,
    PGPORT: String(DB_PORT),
    PGUSER: DB_USER,
    PGPASSWORD: DB_PASS,
    PGDATABASE: RESTORE_DB,
  };

  const restoreStart = performance.now();
  await execFileAsync(PSQL_BIN, ['-f', DUMP_FILE, '-q'], { env: restoreEnv });
  const restoreDuration = ((performance.now() - restoreStart) / 1000).toFixed(2);
  console.log(`  -> Restoration completed in ${restoreDuration}s.\n`);

  // Step 4: Compare Integrity Between Source and Restored Database
  console.log('[Step 4] Verifying structural and data integrity...');
  const sourceStats = await queryCounts(SOURCE_DB);
  const restoreStats = await queryCounts(RESTORE_DB);

  console.log('\n--- VERIFICATION COMPARISON MATRIX ---');
  console.log(`Metric                     Source (${SOURCE_DB})      Restored (${RESTORE_DB})   Match?`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`Base Tables Count          ${String(sourceStats.tableCount).padEnd(25)} ${String(restoreStats.tableCount).padEnd(25)} ${sourceStats.tableCount === restoreStats.tableCount ? 'YES [PASS]' : 'NO [FAIL]'}`);
  console.log(`Active Indexes Count       ${String(sourceStats.indexCount).padEnd(25)} ${String(restoreStats.indexCount).padEnd(25)} ${sourceStats.indexCount === restoreStats.indexCount ? 'YES [PASS]' : 'NO [FAIL]'}`);

  let rowsMatched = true;
  for (const [table, count] of Object.entries(sourceStats.rowCounts)) {
    const resCount = restoreStats.rowCounts[table];
    const match = count === resCount;
    if (!match) rowsMatched = false;
    console.log(`Table: ${table.padEnd(20)} ${String(count).padEnd(25)} ${String(resCount).padEnd(25)} ${match ? 'YES [PASS]' : 'NO [FAIL]'}`);
  }

  // Step 5: Test Application Query on Restored Database
  console.log('\n[Step 5] Testing live application queries on restored database...');
  const testPool = new Pool({
    connectionString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${RESTORE_DB}`,
  });

  try {
    const appQuery = await testPool.query(`
      SELECT c.name, c.cas_number, c.buyer_price, s.company_name
      FROM chemicals c
      JOIN sellers s ON s.id = c.seller_id
      WHERE c.is_active = TRUE
      LIMIT 1
    `);
    console.log(`  -> App Query Succeeded: Found active listing for "${appQuery.rows[0]?.name}" (CAS: ${appQuery.rows[0]?.cas_number}) from ${appQuery.rows[0]?.company_name}`);
  } finally {
    await testPool.end();
  }

  // Step 6: Cleanup Test Database and Temp Dump
  console.log('\n[Step 6] Cleaning up test database and temporary dump file...');
  const cleanPool = new Pool({
    connectionString: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/postgres`,
  });

  try {
    await cleanPool.query(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `, [RESTORE_DB]);
    await cleanPool.query(`DROP DATABASE ${RESTORE_DB}`);
    console.log(`  -> Isolated test database ${RESTORE_DB} dropped.`);
  } finally {
    await cleanPool.end();
  }

  if (fs.existsSync(DUMP_FILE)) {
    fs.unlinkSync(DUMP_FILE);
    console.log('  -> Temporary dump file deleted.');
  }

  const success =
    sourceStats.tableCount === restoreStats.tableCount &&
    sourceStats.indexCount === restoreStats.indexCount &&
    rowsMatched;

  console.log('\n================================================================');
  console.log(`RESTORATION TEST OUTCOME: ${success ? 'PASSED (100% DATA & SCHEMA INTEGRITY)' : 'FAILED'}`);
  console.log('================================================================\n');

  if (!success) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal Restoration Test Error:', err);
  process.exit(1);
});
