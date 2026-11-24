const { pool } = require('../src/db/pool');

async function main() {
  console.log('=== EVIDENCE GATHERING: RECONCILING AUDIT REPORTS ===\n');

  // 1. PostgreSQL Version
  const versionRes = await pool.query('SELECT version()');
  console.log('[PostgreSQL Engine]');
  console.log('Version:', versionRes.rows[0].version);

  // 2. Applied Migrations
  const migRes = await pool.query('SELECT name, applied_at FROM _migrations ORDER BY applied_at ASC');
  console.log('\n[Applied Migrations in _migrations table]');
  console.table(migRes.rows);

  // 3. PostgreSQL Indexes on critical tables
  const indexRes = await pool.query(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'chemicals', 'quotation_requests', 'purchase_orders', 'invoices', 'audit_logs')
    ORDER BY tablename, indexname
  `);
  console.log('\n[Active Database Indexes on Target Tables]');
  console.table(indexRes.rows.map(r => ({ table: r.tablename, index: r.indexname })));

  // Specifically check users.phone, chemicals.cas_number, chemicals.category, quotation_requests.status
  const specificIndexes = [
    'idx_users_phone',
    'idx_users_lower_email',
    'idx_chemicals_cas_number',
    'idx_chemicals_category',
    'idx_quotation_requests_status',
  ];
  console.log('\n[Verification of Contested Specific Indexes]');
  for (const name of specificIndexes) {
    const found = indexRes.rows.find(r => r.indexname === name);
    console.log(`  ${name}: ${found ? 'FOUND (' + found.indexdef + ')' : 'MISSING'}`);
  }

  // 4. PostgreSQL max_connections setting
  const maxConnRes = await pool.query("SHOW max_connections");
  console.log('\n[PostgreSQL Server Connection Limits]');
  console.log('max_connections:', maxConnRes.rows[0].max_connections);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
