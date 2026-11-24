const { pool } = require('./pool');

// Usage:
//   await withTransaction(async (client) => {
//     await client.query('UPDATE ...');
//     await client.query('INSERT ...');
//   });
// Commits if the callback resolves, rolls back and rethrows if it throws.
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { withTransaction };
