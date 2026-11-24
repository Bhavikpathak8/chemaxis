const express = require('express');
const { pool } = require('../../db/pool');
const { asyncHandler } = require('../../middleware/error');
const { authenticate } = require('../../middleware/auth');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');
const { purchaseOrderPdf, deliveryChallanPdf, ewayBillSheetPdf } = require('./pdf/order-documents');

const router = express.Router();
router.use(authenticate);
const STAFF = ['SUPER_ADMIN', 'TRADER_STAFF'];

// GET /purchase-orders/:id/documents/:kind  (kind = po | challan | eway)
router.get('/:id/documents/:kind', asyncHandler(async (req, res) => {
  const { id, kind } = req.params;
  if (!['po', 'challan', 'eway'].includes(kind)) throw new NotFoundError('Unknown document');
  const staff = STAFF.includes(req.user.role);
  if (!staff && req.user.role !== 'BUYER') throw new ForbiddenError('You cannot open this document');
  if (kind === 'eway' && !staff) throw new ForbiddenError('You cannot open this document');

  const { rows } = await pool.query(
    `SELECT po.*, b.user_id AS buyer_user_id FROM purchase_orders po JOIN buyers b ON b.id = po.buyer_id WHERE po.id = $1`, [id]);
  if (rows.length === 0) throw new NotFoundError('Order not found');
  const po = rows[0];
  if (!staff && po.buyer_user_id !== req.user.id) throw new ForbiddenError('You do not own this order');
  if (po.status === 'CANCELLED') throw new BadRequestError('This order was cancelled');

  const { rows: buyer } = await pool.query('SELECT * FROM buyers WHERE id = $1', [po.buyer_id]);
  const { rows: items } = await pool.query(
    `SELECT poi.*, c.name AS chemical_name FROM purchase_order_items poi JOIN chemicals c ON c.id = poi.chemical_id WHERE poi.purchase_order_id = $1 ORDER BY poi.id`, [id]);
  const order = { ...po, buyer: buyer[0], items };

  let pdf;
  if (kind === 'po') {
    if (staff) {
      const { rows: sup } = await pool.query(
        `SELECT DISTINCT s.company_name, s.gst_number FROM purchase_order_items poi JOIN chemicals c ON c.id = poi.chemical_id JOIN sellers s ON s.id = c.seller_id WHERE poi.purchase_order_id = $1 LIMIT 1`, [id]);
      order.supplier = sup[0];
    }
    pdf = await purchaseOrderPdf(order, { internal: staff });
  } else {
    const { rows: t } = await pool.query(
      `SELECT t.*, v.name AS vendor_name, d.name AS driver_name, d.phone AS driver_phone FROM transportation t
       LEFT JOIN transport_vendors v ON v.id = t.vendor_id LEFT JOIN drivers d ON d.id = t.driver_id WHERE t.purchase_order_id = $1`, [id]);
    if (t.length === 0) throw new BadRequestError('Transport has not been arranged for this order yet');
    if (kind === 'challan') pdf = await deliveryChallanPdf(order, t[0]);
    else {
      const { rows: inv } = await pool.query('SELECT invoice_number, total_amount FROM invoices WHERE purchase_order_id = $1', [id]);
      pdf = await ewayBillSheetPdf(order, t[0], inv[0]);
    }
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Disposition', `inline; filename="${kind}-${po.po_number}.pdf"`);
  res.send(pdf);
}));

module.exports = router;
