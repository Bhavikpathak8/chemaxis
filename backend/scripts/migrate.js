// Plain-SQL migration runner. No ORM, no Prisma — just reads migrations/*.sql
// in filename order and applies any that haven't run yet, each in its own
// transaction. Tracks applied migrations in a `_migrations` table.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function run() {
  if (!process.env.DATABASE_URL) {
    console.warn('[Migrations] No DATABASE_URL set. Skipping migrations.');
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const sslMode =
    process.env.DATABASE_SSL === 'true' ||
    (isProduction &&
      !process.env.DATABASE_URL.includes('localhost') &&
      !process.env.DATABASE_URL.includes('127.0.0.1'));

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(sslMode ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name        TEXT PRIMARY KEY,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const applied = new Set(
      (await pool.query('SELECT name FROM _migrations')).rows.map((r) => r.name),
    );

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort(); // filenames are numerically prefixed (001_, 002_, ...) so sort() gives correct order

    let appliedCount = 0;
    for (const file of files) {
      if (applied.has(file)) continue;

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied: ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply ${file}:`, err.message);
        throw err;
      } finally {
        client.release();
      }
    }

    if (appliedCount === 0) {
      console.log('No pending migrations — database is up to date.');
    } else {
      console.log(`Applied ${appliedCount} migration(s).`);
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run };
