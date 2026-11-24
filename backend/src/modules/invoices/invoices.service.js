const { pool } = require('../../db/pool');
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError } = require('../../utils/errors');
const { generateInvoicePdfBuffer } = require('./pdf/invoice-pdf');
const { saveGeneratedFile } = require('../../middleware/upload');

function generateInvoiceNumber(sequence) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(sequence).padStart(5, '0')}`;
}

async function generateForOrder(poId, dto) {
  const { rows: poRows } = await pool.query(
    `SELECT po.*, b.company_name, b.gst_number, b.address, b.city, b.state, b.pincode
     FROM purchase_orders po JOIN buyers b ON b.id = po.buyer_id
     WHERE po.id = $1`,
    [poId],
  );
  if (poRows.length === 0) throw new NotFoundError('Purchase order not found');
  const po = poRows[0];
  if (po.status === 'CANCELLED') throw new BadRequestError('Cannot invoice a cancelled order');

  const { rows: existingInvoice } = await pool.query('SELECT id FROM invoices WHERE purchase_order_id = $1', [poId]);
  if (existingInvoice.length > 0) throw new ConflictError('An invoice already exists for this order');

  const { rows: itemRows } = await pool.query(
    `SELECT poi.quantity, poi.unit, poi.buyer_price_per_unit, poi.subtotal, c.name AS chemical_name
     FROM purchase_order_items poi JOIN chemicals c ON c.id = poi.chemical_id
     WHERE poi.purchase_order_id = $1`,
    [poId],
  );

  const gstRatePercent =
    dto.gstRatePercent ?? Number((await pool.query('SELECT default_gst_rate_percent FROM gst_settings WHERE id = 1')).rows[0].default_gst_rate_percent);

  const subtotal = Number(po.total_amount);
  const gstAmount = Math.round(subtotal * (gstRatePercent / 100) * 100) / 100;
  const grandTotal = subtotal + gstAmount;
  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM invoices WHERE issued_at >= date_trunc('year', now())`,
  );
  const invoiceNumber = generateInvoiceNumber(Number(countRows[0].count) + 1);

  const pdfBuffer = await generateInvoicePdfBuffer({
    invoiceNumber,
    poNumber: po.po_number,
    issuedAt: new Date(),
    dueDate,
    buyer: {
      companyName: po.company_name,
      gstNumber: po.gst_number,
      address: po.address,
      city: po.city,
      state: po.state,
      pincode: po.pincode,
    },
    items: itemRows.map((item) => ({
      chemicalName: item.chemical_name,
      quantity: Number(item.quantity),
      unit: item.unit,
      pricePerUnit: Number(item.buyer_price_per_unit),
      subtotal: Number(item.subtotal),
    })),
    subtotal,
    gstAmount,
    gstRatePercent,
    grandTotal,
  });

  const pdfUrl = saveGeneratedFile('invoices', `${invoiceNumber}.pdf`, pdfBuffer);

  const { rows } = await pool.query(
    `INSERT INTO invoices (invoice_number, purchase_order_id, gst_amount, total_amount, pdf_url, qr_data, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [invoiceNumber, poId, gstAmount, grandTotal, pdfUrl, invoiceNumber, dueDate],
  );
  return rows[0];
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT inv.*, po.po_number, b.company_name AS buyer_company_name,
            COALESCE(pp.paid,0) AS paid, inv.total_amount - COALESCE(pp.paid,0) AS outstanding
     FROM invoices inv
     JOIN purchase_orders po ON po.id = inv.purchase_order_id
     JOIN buyers b ON b.id = po.buyer_id
     LEFT JOIN (SELECT invoice_id, SUM(amount) paid FROM payments WHERE status='PAID' GROUP BY 1) pp ON pp.invoice_id = inv.id
     ORDER BY inv.issued_at DESC`,
  );
  return rows;
}

async function findOne(invoiceId) {
  const { rows } = await pool.query('SELECT * FROM invoices WHERE id = $1', [invoiceId]);
  if (rows.length === 0) throw new NotFoundError('Invoice not found');
  return rows[0];
}

// Buyer-facing — "Download invoice" from the spec's buyer dashboard.
async function findForBuyerOrder(userId, poId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const { rows: poRows } = await pool.query('SELECT buyer_id FROM purchase_orders WHERE id = $1', [poId]);
  if (poRows.length === 0) throw new NotFoundError('Purchase order not found');
  if (poRows[0].buyer_id !== buyerRows[0].id) throw new ForbiddenError('You do not own this order');

  const { rows } = await pool.query('SELECT * FROM invoices WHERE purchase_order_id = $1', [poId]);
  if (rows.length === 0) throw new NotFoundError('No invoice has been generated for this order yet');
  return rows[0];
}

async function findAllForBuyer(userId) {
  const { rows } = await pool.query(
    `SELECT inv.*, po.po_number, COALESCE(pp.paid,0) AS paid, inv.total_amount - COALESCE(pp.paid,0) AS outstanding
     FROM invoices inv
     JOIN purchase_orders po ON po.id = inv.purchase_order_id
     JOIN buyers b ON b.id = po.buyer_id AND b.user_id = $1
     LEFT JOIN (SELECT invoice_id, SUM(amount) paid FROM payments WHERE status='PAID' GROUP BY 1) pp ON pp.invoice_id = inv.id
     ORDER BY inv.issued_at DESC`, [userId]);
  return rows;
}

module.exports = { findAllForBuyer, generateForOrder, findAll, findOne, findForBuyerOrder };
