const { pool } = require('../db/pool');

// Notification Workflow from WORKFLOW.md. The spec's "Finance Admin" has no
// separate role in the RBAC list, so SUPER_ADMIN + TRADER_STAFF stand in.
async function notifyUser(userId, eventType, title, message, db = pool) {
  if (!userId) return;
  await db.query(
    `INSERT INTO notifications (user_id, event_type, title, message) VALUES ($1, $2, $3, $4)`,
    [userId, eventType, title, message],
  );
}

async function notifyRole(roles, eventType, title, message, db = pool) {
  await db.query(
    `INSERT INTO notifications (user_id, event_type, title, message)
     SELECT id, $2, $3, $4 FROM users WHERE role = ANY($1::user_role[]) AND is_active = TRUE`,
    [roles, eventType, title, message],
  );
}

module.exports = { notifyUser, notifyRole };
