const { pool } = require('../../db/pool');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const { notifyRole } = require('../../common/notify');

// --- Buyer -> Trader payments ---------------------------------------------
async function create(dto, recordedByUserId) {
  const { rows: invRows } = await pool.query('SELECT * FROM invoices WHERE id = $1', [dto.invoiceId]);
  if (invRows.length === 0) throw new NotFoundError('Invoice not found');
  const invoice = invRows[0];

  const { rows: paidRows } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE invoice_id = $1 AND status = 'PAID'`,
    [dto.invoiceId],
  );
  const alreadyPaid = Number(paidRows[0].paid);
  const outstanding = Number(invoice.total_amount) - alreadyPaid;

  if (dto.amount > outstanding + 0.01) {
    throw new BadRequestError(
      `Payment of ${dto.amount} exceeds the outstanding balance of ${outstanding.toFixed(2)} on this invoice`,
    );
  }

  const { rows } = await pool.query(
    `INSERT INTO payments (invoice_id, amount, method, reference_note, status, recorded_by, paid_at)
     VALUES ($1, $2, $3, $4, 'PAID', $5, now()) RETURNING *`,
    [dto.invoiceId, dto.amount, dto.method, dto.referenceNote ?? null, recordedByUserId],
  );
  // Payment Received -> "Finance Admin" (SUPER_ADMIN + TRADER_STAFF)
  await notifyRole(['SUPER_ADMIN', 'TRADER_STAFF'], 'PAYMENT_RECEIVED', 'Payment received',
    `Payment of Rs. ${dto.amount} recorded against invoice ${invoice.invoice_number ?? invoice.id}.`);
  return rows[0];
}

async function findForInvoice(invoiceId) {
  const { rows } = await pool.query('SELECT * FROM payments WHERE invoice_id = $1 ORDER BY created_at DESC', [
    invoiceId,
  ]);
  return rows;
}

// --- Trader -> Seller payouts ("Seller payment recorded" workflow step) ---
async function findAll() {
  const { rows } = await pool.query(
    `SELECT p.*, i.invoice_number, po.po_number, b.company_name AS buyer_company_name
     FROM payments p
     JOIN invoices i ON i.id = p.invoice_id
     JOIN purchase_orders po ON po.id = i.purchase_order_id
     JOIN buyers b ON b.id = po.buyer_id
     ORDER BY p.created_at DESC LIMIT 1000`);
  return rows;
}

async function findAllPayouts() {
  const { rows } = await pool.query(
    `SELECT sp.*, s.company_name AS seller_company_name, po.po_number
     FROM seller_payouts sp JOIN sellers s ON s.id = sp.seller_id JOIN purchase_orders po ON po.id = sp.purchase_order_id
     ORDER BY sp.paid_at DESC LIMIT 1000`);
  return rows;
}

async function createPayout(poId, dto) {
  const { rows: itemRows } = await pool.query(
    `SELECT c.seller_id FROM purchase_order_items poi JOIN chemicals c ON c.id = poi.chemical_id
     WHERE poi.purchase_order_id = $1 LIMIT 1`,
    [poId],
  );
  if (itemRows.length === 0) throw new NotFoundError('Purchase order not found or has no items');

  // Never pay a seller more than C-Tech owes them on this order.
  const { rows: owed } = await pool.query(
    `SELECT COALESCE(SUM(seller_price_per_unit * quantity),0) AS owed FROM purchase_order_items WHERE purchase_order_id = $1`, [poId]);
  const { rows: already } = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS paid FROM seller_payouts WHERE purchase_order_id = $1`, [poId]);
  const remaining = Number(owed[0].owed) - Number(already[0].paid);
  if (dto.amount > remaining + 0.01) {
    throw new BadRequestError(`Payout of ${dto.amount} exceeds the ${remaining.toFixed(2)} still owed to the seller on this order`);
  }

  const { rows } = await pool.query(
    `INSERT INTO seller_payouts (purchase_order_id, seller_id, amount, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [poId, itemRows[0].seller_id, dto.amount, dto.notes ?? null],
  );
  return rows[0];
}

async function findPayoutsForOrder(poId) {
  const { rows } = await pool.query(
    `SELECT sp.*, s.company_name AS seller_company_name
     FROM seller_payouts sp JOIN sellers s ON s.id = sp.seller_id
     WHERE sp.purchase_order_id = $1 ORDER BY sp.paid_at DESC`,
    [poId],
  );
  return rows;
}

module.exports = { create, findAll, findAllPayouts, findForInvoice, createPayout, findPayoutsForOrder };
