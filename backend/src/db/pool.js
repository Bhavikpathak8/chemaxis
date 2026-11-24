const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 25),
  min: Number(process.env.DB_POOL_MIN || 4),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 5000),
  maxUses: Number(process.env.DB_MAX_USES || 7500),
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
