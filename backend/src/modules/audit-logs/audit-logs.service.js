const { pool } = require('../../db/pool');

async function find({ entityType, userId, action }) {
  const conds = [];
  const vals = [];
  if (entityType) { vals.push(entityType); conds.push(`a.entity_type = $${vals.length}`); }
  if (userId) { vals.push(userId); conds.push(`a.user_id = $${vals.length}`); }
  if (action) { vals.push(action); conds.push(`a.action = $${vals.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT a.*, u.email AS user_email
     FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
     ${where} ORDER BY a.created_at DESC LIMIT 200`,
    vals,
  );
  return rows;
}

module.exports = { find };
