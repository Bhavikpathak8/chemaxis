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
