const { pool } = require('../../db/pool');
const { NotFoundError } = require('../../utils/errors');

async function findMine(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [userId],
  );
  const { rows: c } = await pool.query(
    `SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId],
  );
  return { unreadCount: c[0].unread, items: rows };
}

async function markRead(userId, id) {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId],
  );
  if (rows.length === 0) throw new NotFoundError('Notification not found');
  return rows[0];
}

async function markAllRead(userId) {
  const { rowCount } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
    [userId],
  );
  return { updated: rowCount };
}

module.exports = { findMine, markRead, markAllRead };
