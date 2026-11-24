const bcrypt = require('bcryptjs');
const { pool } = require('../../db/pool');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const { notifyUser } = require('../../common/notify');

const SALT_ROUNDS = 12;

async function findPendingSellers() {
  const { rows } = await pool.query(
    `SELECT s.*, u.email, u.phone, u.created_at as user_created_at
     FROM sellers s JOIN users u ON u.id = s.user_id
     WHERE s.verification_status = 'PENDING'
     ORDER BY s.created_at DESC`,
  );
  return rows;
}

async function findPendingBuyers() {
  const { rows } = await pool.query(
    `SELECT b.*, u.email, u.phone, u.created_at as user_created_at
     FROM buyers b JOIN users u ON u.id = b.user_id
     WHERE b.verification_status = 'PENDING'
     ORDER BY b.created_at DESC`,
  );
  return rows;
}

async function setSellerVerification(sellerId, status, rejectionReason = null, actingUserId = null) {
  const { rows } = await pool.query(
    `UPDATE sellers
     SET verification_status = $2::verification_status,
         rejection_reason = $3,
         verified_at = CASE WHEN $2::verification_status = 'APPROVED' THEN now() ELSE NULL END,
         updated_at = now()
     WHERE id = $1 RETURNING *`,
    [sellerId, status, rejectionReason],
  );
  if (rows.length === 0) throw new NotFoundError('Seller not found');
  const seller = rows[0];

  const { rows: userRows } = await pool.query('SELECT email FROM users WHERE id = $1', [seller.user_id]);
  const sellerEmail = userRows[0]?.email;

  if (status === 'APPROVED') {
    await notifyUser(
      seller.user_id,
      'SELLER_APPROVED',
      'Account approved & verified',
      'Your seller account has been approved. You can now list chemical products and manage quotes.',
    );
    if (sellerEmail) {
      const { sendSellerStatusEmail } = require('../../common/email');
      await sendSellerStatusEmail(sellerEmail, seller.company_name, 'APPROVED').catch(() => null);
    }
  } else if (status === 'REJECTED') {
    await notifyUser(
      seller.user_id,
      'SELLER_REJECTED',
      'Verification details rejected',
      `Your verification application was not approved. Reason: ${rejectionReason || 'Incomplete documentation'}. You can correct and resubmit your details from your workspace.`,
    );
    if (sellerEmail) {
      const { sendSellerStatusEmail } = require('../../common/email');
      await sendSellerStatusEmail(sellerEmail, seller.company_name, 'REJECTED', rejectionReason).catch(() => null);
    }
  }

  return seller;
}

async function setBuyerVerification(buyerId, status, rejectionReason = null, actingUserId = null) {
  const { rows } = await pool.query(
    `UPDATE buyers
     SET verification_status = $2::verification_status,
         updated_at = now()
     WHERE id = $1 RETURNING *`,
    [buyerId, status],
  );
  if (rows.length === 0) throw new NotFoundError('Buyer not found');
  const buyer = rows[0];

  if (status === 'APPROVED') {
    await notifyUser(
      buyer.user_id,
      'BUYER_APPROVED',
      'Account approved',
      'Your buyer account has been approved. You can now browse chemical catalog lots and request official spot quotations.',
    );
  }

  return buyer;
}

async function deactivateUser(userId, actingUserId) {
  if (userId === actingUserId) throw new BadRequestError('You cannot ban your own account');
  const { rows } = await pool.query(
    `UPDATE users SET is_active = FALSE, updated_at = now() WHERE id = $1 RETURNING id, email, is_active`,
    [userId],
  );
  if (rows.length === 0) throw new NotFoundError('User not found');
  return rows[0];
}

async function activateUser(userId) {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = TRUE, updated_at = now() WHERE id = $1 RETURNING id, email, is_active`,
    [userId],
  );
  if (rows.length === 0) throw new NotFoundError('User not found');
  return rows[0];
}

// Super Admin user management: every account, filterable.
async function listUsers({ role, status, search }) {
  const vals = [];
  const conds = [];
  if (role) { vals.push(role); conds.push(`u.role = $${vals.length}::user_role`); }
  if (status === 'active') conds.push('u.is_active');
  if (status === 'banned') conds.push('NOT u.is_active');
  if (search) { vals.push(`%${search}%`); conds.push(`(u.email ILIKE $${vals.length} OR COALESCE(s.company_name, b.company_name, '') ILIKE $${vals.length})`); }
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.role, u.phone, u.is_active, u.created_at,
            COALESCE(s.company_name, b.company_name) AS company_name,
            COALESCE(s.verification_status, b.verification_status) AS verification_status
     FROM users u LEFT JOIN sellers s ON s.user_id = u.id LEFT JOIN buyers b ON b.user_id = u.id
     ${conds.length ? 'WHERE ' + conds.join(' AND ') : ''}
     ORDER BY u.created_at DESC LIMIT 500`, vals);
  return rows;
}

// Directory of all sellers / buyers (not just pending) for the trader.
async function listSellers(status) {
  const { rows } = await pool.query(
    `SELECT s.*, u.email, u.phone, u.is_active,
            (SELECT COUNT(*)::int FROM chemicals c WHERE c.seller_id = s.id) AS chemical_count
     FROM sellers s JOIN users u ON u.id = s.user_id
     WHERE ($1::text IS NULL OR s.verification_status = $1::verification_status)
     ORDER BY s.created_at DESC`, [status ?? null]);
  return rows;
}

async function listBuyers(status) {
  const { rows } = await pool.query(
    `SELECT b.*, u.email, u.phone, u.is_active,
            (SELECT COUNT(*)::int FROM purchase_orders po WHERE po.buyer_id = b.id) AS order_count
     FROM buyers b JOIN users u ON u.id = b.user_id
     WHERE ($1::text IS NULL OR b.verification_status = $1::verification_status)
     ORDER BY b.created_at DESC`, [status ?? null]);
  return rows;
}

// Company documents the trader reviews before approving a seller.
async function sellerDocuments(sellerId) {
  const { rows } = await pool.query(`SELECT * FROM seller_documents WHERE seller_id = $1 ORDER BY uploaded_at DESC`, [sellerId]);
  return rows;
}

// "GST verification" — the trader checks the GSTIN and the uploaded GST
// certificate, then flips this flag. Separate from account approval.
async function setGstVerified(kind, id, verified) {
  const table = kind === 'seller' ? 'sellers' : 'buyers';
  const { rows } = await pool.query(`UPDATE ${table} SET gst_verified = $2, updated_at = now() WHERE id = $1 RETURNING *`, [id, verified]);
  if (rows.length === 0) throw new NotFoundError(`${kind === 'seller' ? 'Seller' : 'Buyer'} not found`);
  return rows[0];
}

// Super Admin only — the only way TRADER_STAFF/SUPER_ADMIN accounts get
// created. There's no public signup path for the admin side.
async function createStaff({ email, password, phone, role }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4) RETURNING id, email, role, created_at`,
    [email, passwordHash, role || 'TRADER_STAFF', phone ?? null],
  );
  return rows[0];
}

module.exports = {
  findPendingSellers,
  findPendingBuyers,
  setSellerVerification,
  setBuyerVerification,
  deactivateUser,
  activateUser,
  listUsers,
  listSellers,
  listBuyers,
  sellerDocuments,
  setGstVerified,
  createStaff,
};
