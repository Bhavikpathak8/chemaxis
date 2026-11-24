const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const sslMode =
  process.env.DATABASE_SSL === 'true' ||
  (isProduction &&
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('localhost') &&
    !process.env.DATABASE_URL.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 25),
  min: Number(process.env.DB_POOL_MIN || (isProduction ? 2 : 4)),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 5000),
  maxUses: Number(process.env.DB_MAX_USES || 7500),
  ...(sslMode ? { ssl: { rejectUnauthorized: false } } : {}),
});

pool.on('error', (err) => {
  // Idle client errors shouldn't crash the process
  console.error('[PostgreSQL Pool Warning] Unexpected error on idle Postgres client:', err.message);
});

async function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

module.exports = {
  pool,
  getPoolStats,
};
