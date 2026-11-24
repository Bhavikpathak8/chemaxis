const { pool } = require('../db/pool');

// Records an admin/system action. Pass the transaction `client` as `db` when
// the action is part of a transaction so the log commits/rolls back with it.
async function logAction({ userId, action, entityType, entityId, metadata }, db = pool) {
  await db.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId ?? null, action, entityType, entityId != null ? String(entityId) : null, metadata ? JSON.stringify(metadata) : null],
  );
}

module.exports = { logAction };
