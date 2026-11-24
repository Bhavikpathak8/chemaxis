const express = require('express');
const { spawn } = require('child_process');
const { authenticate, requireRole } = require('../../middleware/auth');
const { logAction } = require('../../common/audit-log');

const router = express.Router();
router.use(authenticate, requireRole('SUPER_ADMIN'));

// Connection settings go to pg_dump through PG* environment variables, never
// on the command line where any local user could read the password.
function pgEnv() {
  const u = new URL(process.env.DATABASE_URL);
  return {
    ...process.env,
    PGHOST: u.hostname, PGPORT: u.port || '5432', PGUSER: decodeURIComponent(u.username),
    PGPASSWORD: decodeURIComponent(u.password), PGDATABASE: u.pathname.replace(/^\//, ''),
  };
}

// GET /backup — streams a plain-SQL dump of the whole database.
// Set PG_DUMP_PATH if pg_dump is not on PATH (typical on Windows:
// C:\Program Files\PostgreSQL\16\bin\pg_dump.exe).
router.get('/', (req, res, next) => {
  const bin = process.env.PG_DUMP_PATH || 'pg_dump';
  let started = false;
  let stderr = '';
  let child;
  try {
    child = spawn(bin, ['--no-owner', '--no-privileges', '--format=plain'], { env: pgEnv() });
  } catch (err) { return next(err); }

  child.on('error', (err) => {
    if (res.headersSent) return res.destroy();
    res.status(501).json({ message: err.code === 'ENOENT'
      ? 'pg_dump was not found on the server. Install the PostgreSQL client tools or set PG_DUMP_PATH in .env.'
      : `Could not start pg_dump: ${err.message}` });
  });
  child.stderr.on('data', (d) => { stderr += d.toString().slice(0, 2000); });
  child.stdout.on('data', (chunk) => {
    if (!started) {
      started = true;
      const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      res.setHeader('Content-Type', 'application/sql; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="ctech-backup-${stamp}.sql"`);
      res.setHeader('Cache-Control', 'no-store');
    }
    res.write(chunk);
  });
  child.on('close', async (code) => {
    if (code === 0 && started) {
      await logAction({ userId: req.user.id, action: 'BACKUP_DATABASE', entityType: 'Database', entityId: null, metadata: {} }).catch(() => {});
      return res.end();
    }
    if (!res.headersSent) return res.status(500).json({ message: `Backup failed${stderr ? `: ${stderr.trim().split('\n')[0]}` : ''}` });
    res.destroy(); // partial file: don't let the client mistake it for a complete backup
  });
  res.on('close', () => { if (child.exitCode === null) child.kill(); });
});

module.exports = router;
