const { pool } = require('../../db/pool');
const { NotFoundError } = require('../../utils/errors');

async function getMyProfile(userId) {
  const { rows } = await pool.query(
    `SELECT b.*, u.email, u.phone, u.is_active
     FROM buyers b JOIN users u ON u.id = b.user_id
     WHERE b.user_id = $1`,
    [userId],
  );
  if (rows.length === 0) throw new NotFoundError('Buyer profile not found');
  return rows[0];
}

async function updateMyProfile(userId, dto) {
  const fieldMap = {
    companyName: 'company_name',
    address: 'address',
    city: 'city',
    state: 'state',
    pincode: 'pincode',
  };

  const sets = [];
  const values = [];
  let i = 1;
  for (const [key, column] of Object.entries(fieldMap)) {
    if (dto[key] !== undefined) {
      sets.push(`${column} = $${i}`);
      values.push(dto[key]);
      i++;
    }
  }
  if (sets.length === 0) return getMyProfile(userId);

  sets.push('updated_at = now()');
  values.push(userId);

  const { rows } = await pool.query(
    `UPDATE buyers SET ${sets.join(', ')} WHERE user_id = $${i} RETURNING *`,
    values,
  );
  if (rows.length === 0) throw new NotFoundError('Buyer profile not found');
  return rows[0];
}

// "Purchase History" — reads purchase_orders. Correctly empty until the
// Orders module (Phase 5) starts writing to this table.
async function getMyOrderHistory(userId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const { rows } = await pool.query(
    `SELECT po.*
     FROM purchase_orders po
     WHERE po.buyer_id = $1
     ORDER BY po.created_at DESC`,
    [buyerRows[0].id],
  );
  return rows;
}

// "Payment history" — reads payments against this buyer's invoices.
// Correctly empty until Phase 7's Payments module writes to this table.
async function getMyPaymentHistory(userId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const { rows } = await pool.query(
    `SELECT p.*
     FROM payments p
     JOIN invoices inv ON inv.id = p.invoice_id
     JOIN purchase_orders po ON po.id = inv.purchase_order_id
     WHERE po.buyer_id = $1
     ORDER BY p.created_at DESC`,
    [buyerRows[0].id],
  );
  return rows;
}

module.exports = { getMyProfile, updateMyProfile, getMyOrderHistory, getMyPaymentHistory };
