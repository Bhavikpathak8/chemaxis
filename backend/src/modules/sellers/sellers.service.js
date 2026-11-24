const { pool } = require('../../db/pool');
const { NotFoundError } = require('../../utils/errors');

async function getMyProfile(userId) {
  const { rows } = await pool.query(
    `SELECT s.*, u.email, u.phone, u.is_active
     FROM sellers s JOIN users u ON u.id = s.user_id
     WHERE s.user_id = $1`,
    [userId],
  );
  if (rows.length === 0) throw new NotFoundError('Seller profile not found');
  const seller = rows[0];

  const [chemicals, documents] = await Promise.all([
    pool.query(
      `SELECT id, name, is_active, (buyer_price IS NOT NULL) AS is_listed FROM chemicals WHERE seller_id = $1 ORDER BY created_at DESC`,
      [seller.id],
    ),
    pool.query(`SELECT * FROM seller_documents WHERE seller_id = $1 ORDER BY uploaded_at DESC`, [
      seller.id,
    ]),
  ]);

  return { ...seller, chemicals: chemicals.rows, documents: documents.rows };
}

async function updateMyProfile(userId, dto) {
  const fieldMap = {
    companyName: 'company_name',
    contactPerson: 'contact_person',
    businessType: 'business_type',
    panNumber: 'pan_number',
    cinNumber: 'cin_number',
    website: 'website',
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
    `UPDATE sellers SET ${sets.join(', ')} WHERE user_id = $${i} RETURNING *`,
    values,
  );
  if (rows.length === 0) throw new NotFoundError('Seller profile not found');
  return rows[0];
}

async function attachCompanyDocument(userId, type, fileUrl) {
  const { rows: sellerRows } = await pool.query('SELECT id FROM sellers WHERE user_id = $1', [userId]);
  if (sellerRows.length === 0) throw new NotFoundError('Seller profile not found');

  const { rows } = await pool.query(
    `INSERT INTO seller_documents (seller_id, type, file_url) VALUES ($1, $2, $3) RETURNING *`,
    [sellerRows[0].id, type, fileUrl],
  );
  return rows[0];
}

// Order/payment history — reads across purchase_orders/invoices/payments.
// These tables exist from Phase 1's schema; the write paths that actually
// populate them (Orders, Invoices, Payments modules) land in Phases 5-7, so
// this will correctly return an empty list until then.
async function getMyOrderHistory(userId) {
  const { rows: sellerRows } = await pool.query('SELECT id FROM sellers WHERE user_id = $1', [userId]);
  if (sellerRows.length === 0) throw new NotFoundError('Seller profile not found');

  // Line items are shown at the SELLER's own price. The buyer's identity,
  // buyer price and C-Tech's margin are deliberately not selected.
  const { rows } = await pool.query(
    `SELECT po.id, po.po_number, po.status, po.created_at, po.delivered_at,
            SUM(poi.seller_price_per_unit * poi.quantity) AS amount,
            json_agg(json_build_object('chemical_id', c.id, 'chemical_name', c.name, 'quantity', poi.quantity, 'unit', poi.unit,
                                       'price_per_unit', poi.seller_price_per_unit, 'subtotal', poi.seller_price_per_unit * poi.quantity)) AS items
     FROM purchase_orders po
     JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
     JOIN chemicals c ON c.id = poi.chemical_id AND c.seller_id = $1
     GROUP BY po.id
     ORDER BY po.created_at DESC`,
    [sellerRows[0].id],
  );
  return rows;
}

async function getMyPaymentHistory(userId) {
  const { rows: sellerRows } = await pool.query('SELECT id FROM sellers WHERE user_id = $1', [userId]);
  if (sellerRows.length === 0) throw new NotFoundError('Seller profile not found');

  const { rows } = await pool.query(
    `SELECT sp.* FROM seller_payouts sp WHERE sp.seller_id = $1 ORDER BY sp.paid_at DESC`,
    [sellerRows[0].id],
  );
  return rows;
}

async function resubmitVerification(userId, dto) {
  const { rows: sellerRows } = await pool.query('SELECT id, company_name FROM sellers WHERE user_id = $1', [userId]);
  if (sellerRows.length === 0) throw new NotFoundError('Seller profile not found');

  const fieldMap = {
    companyName: 'company_name',
    contactPerson: 'contact_person',
    businessType: 'business_type',
    gstNumber: 'gst_number',
    panNumber: 'pan_number',
    cinNumber: 'cin_number',
    address: 'address',
    city: 'city',
    state: 'state',
    pincode: 'pincode',
    website: 'website',
  };

  const sets = [
    "verification_status = 'UNDER_REVIEW'",
    "resubmitted_at = now()",
    "rejection_reason = NULL",
    "updated_at = now()",
  ];
  const values = [];
  let i = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    if (dto[key] !== undefined) {
      sets.push(`${column} = $${i}`);
      values.push(dto[key]);
      i++;
    }
  }

  values.push(userId);
  const { rows } = await pool.query(
    `UPDATE sellers SET ${sets.join(', ')} WHERE user_id = $${i} RETURNING *`,
    values,
  );

  const { notifyRole } = require('../../common/notify');
  await notifyRole(
    ['SUPER_ADMIN', 'TRADER_STAFF'],
    'SELLER_RESUBMITTED',
    'Verification Resubmitted',
    `${sellerRows[0].company_name} has corrected and resubmitted their compliance documents for review.`,
  );

  return rows[0];
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  attachCompanyDocument,
  getMyOrderHistory,
  getMyPaymentHistory,
  resubmitVerification,
};
