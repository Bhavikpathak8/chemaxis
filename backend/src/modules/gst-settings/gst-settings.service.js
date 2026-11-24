const { pool } = require('../../db/pool');

async function get() {
  const { rows } = await pool.query('SELECT * FROM gst_settings WHERE id = 1');
  return rows[0]; // always exists — seeded by migration 001_init.sql
}

async function update(defaultGstRatePercent) {
  const { rows } = await pool.query(
    `UPDATE gst_settings SET default_gst_rate_percent = $1, updated_at = now() WHERE id = 1 RETURNING *`,
    [defaultGstRatePercent],
  );
  return rows[0];
}

module.exports = { get, update };
