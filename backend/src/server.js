const { loadEnvironment } = require('./config/env');
loadEnvironment();
const { createApp } = require('./app');
const { pool } = require('./db/pool');

const app = createApp();
const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`[ChemAxis API] Institutional Chemical Trade Desk running on http://localhost:${port}/api/v1`);
  console.log(`[ChemAxis API] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[ChemAxis API] Health check ready at http://localhost:${port}/api/v1/health/ready`);

  // Automatically execute pending database migrations and seed default data if DB is connected
  if (process.env.DATABASE_URL) {
    const { run: runMigrations } = require('../scripts/migrate');
    runMigrations()
      .then(async () => {
        console.log('[ChemAxis DB] Migrations verified and executed successfully.');
        try {
          const userCount = await pool.query('SELECT COUNT(*) AS count FROM users');
          if (Number(userCount.rows[0]?.count) === 0) {
            console.log('[ChemAxis DB] Fresh database detected. Seeding initial accounts...');
            const { seedDemo } = require('../scripts/seed-demo');
            await seedDemo(pool);
            console.log('[ChemAxis DB] Initial accounts seeded successfully.');
          }
        } catch (seedErr) {
          console.warn('[ChemAxis DB Seed Warning]:', seedErr.message);
        }
      })
      .catch((err) => console.error('[ChemAxis Migration Error]:', err.message));
  }
});

// -----------------------------------------------------------------------------
// Graceful Shutdown Handler
// -----------------------------------------------------------------------------
let isShuttingDown = false;

async function handleGracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[ChemAxis API] Received ${signal}. Commencing graceful shutdown sequence...`);

  // Force shutdown after timeout in case hanging connections exist
  const forceTimer = setTimeout(() => {
    console.error('[ChemAxis API] Forceful shutdown triggered: active connections failed to drain in time.');
    process.exit(1);
  }, 10000);
  if (forceTimer.unref) forceTimer.unref();

  server.close(async (err) => {
    if (err) {
      console.error('[ChemAxis API] Error during HTTP server close:', err.message);
    } else {
      console.log('[ChemAxis API] HTTP server closed: no longer accepting connections.');
    }

    try {
      console.log('[ChemAxis API] Draining PostgreSQL connection pool...');
      await pool.end();
      console.log('[ChemAxis API] PostgreSQL pool successfully terminated.');
    } catch (poolErr) {
      console.error('[ChemAxis API] Error draining PostgreSQL pool:', poolErr.message);
    }

    clearTimeout(forceTimer);
    console.log('[ChemAxis API] Graceful shutdown complete. Exiting cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[C-Tech API Fatal] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[C-Tech API Fatal] Uncaught Exception:', err);
  handleGracefulShutdown('UNCAUGHT_EXCEPTION');
});
