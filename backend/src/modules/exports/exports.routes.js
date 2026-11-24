const express = require('express');
const { pool } = require('../../db/pool');
const { asyncHandler } = require('../../middleware/error');
const { authenticate, requireRole } = require('../../middleware/auth');
const { NotFoundError } = require('../../utils/errors');
const { toCsv } = require('../../common/csv');
const { logAction } = require('../../common/audit-log');

const router = express.Router();
router.use(authenticate);

const col = (key, label = key) => ({ key, label });
const DATASETS = {
  orders: {
    roles: ['SUPER_ADMIN', 'TRADER_STAFF'],
    sql: `SELECT po.po_number, b.company_name AS buyer, po.status, po.total_amount, po.gst_amount, po.delivery_address, po.created_at, po.delivered_at
          FROM purchase_orders po JOIN buyers b ON b.id = po.buyer_id ORDER BY po.created_at DESC`,
    columns: [col('po_number', 'PO number'), col('buyer', 'Buyer'), col('status', 'Status'), col('total_amount', 'Total (INR)'), col('gst_amount', 'GST (INR)'), col('delivery_address', 'Delivery address'), col('created_at', 'Created'), col('delivered_at', 'Delivered')],
  },
  transactions: {
    roles: ['SUPER_ADMIN', 'TRADER_STAFF'],
    sql: `SELECT po.po_number, b.company_name AS buyer, t.seller_amount, t.buyer_amount, t.gross_margin, t.total_expense, t.net_profit, t.calculated_at
          FROM transactions t JOIN purchase_orders po ON po.id = t.purchase_order_id JOIN buyers b ON b.id = po.buyer_id ORDER BY t.calculated_at DESC`,
    columns: [col('po_number', 'PO number'), col('buyer', 'Buyer'), col('seller_amount', 'Seller amount'), col('buyer_amount', 'Buyer amount'), col('gross_margin', 'Gross margin'), col('total_expense', 'Expenses'), col('net_profit', 'Net profit'), col('calculated_at', 'Calculated')],
  },
  invoices: {
    roles: ['SUPER_ADMIN', 'TRADER_STAFF'],
    sql: `SELECT i.invoice_number, po.po_number, b.company_name AS buyer, i.gst_amount, i.total_amount,
                 COALESCE(p.paid,0) AS paid, i.total_amount - COALESCE(p.paid,0) AS outstanding, i.issued_at, i.due_date
          FROM invoices i JOIN purchase_orders po ON po.id = i.purchase_order_id JOIN buyers b ON b.id = po.buyer_id
          LEFT JOIN (SELECT invoice_id, SUM(amount) paid FROM payments WHERE status='PAID' GROUP BY 1) p ON p.invoice_id = i.id
          ORDER BY i.issued_at DESC`,
    columns: [col('invoice_number', 'Invoice'), col('po_number', 'PO'), col('buyer', 'Buyer'), col('gst_amount', 'GST'), col('total_amount', 'Total'), col('paid', 'Paid'), col('outstanding', 'Outstanding'), col('issued_at', 'Issued'), col('due_date', 'Due')],
  },
  payments: {
    roles: ['SUPER_ADMIN', 'TRADER_STAFF'],
    sql: `SELECT i.invoice_number, b.company_name AS buyer, p.amount, p.method, p.status, p.reference_note, p.paid_at
          FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN purchase_orders po ON po.id = i.purchase_order_id JOIN buyers b ON b.id = po.buyer_id
          ORDER BY p.created_at DESC`,
    columns: [col('invoice_number', 'Invoice'), col('buyer', 'Buyer'), col('amount', 'Amount'), col('method', 'Method'), col('status', 'Status'), col('reference_note', 'Reference'), col('paid_at', 'Paid at')],
  },
  expenses: {
    roles: ['SUPER_ADMIN', 'TRADER_STAFF'],
    sql: `SELECT po.po_number, ec.name AS category, e.amount, e.description, e.created_at
          FROM expenses e JOIN expense_categories ec ON ec.id = e.category_id JOIN purchase_orders po ON po.id = e.purchase_order_id ORDER BY e.created_at DESC`,
    columns: [col('po_number', 'PO'), col('category', 'Category'), col('amount', 'Amount'), col('description', 'Description'), col('created_at', 'Logged')],
  },
  chemicals: {
    roles: ['SUPER_ADMIN', 'TRADER_STAFF'],
    sql: `SELECT c.name, c.category, c.cas_number, c.purity, c.unit, s.company_name AS seller, c.seller_price, c.buyer_price, c.warehouse_location,
                 COALESCE(i.quantity_available,0) AS stock, c.is_active
          FROM chemicals c JOIN sellers s ON s.id = c.seller_id LEFT JOIN inventory i ON i.chemical_id = c.id ORDER BY c.name`,
    columns: [col('name', 'Chemical'), col('category', 'Category'), col('cas_number', 'CAS'), col('purity', 'Purity'), col('unit', 'Unit'), col('seller', 'Seller'), col('seller_price', 'Seller price'), col('buyer_price', 'Buyer price'), col('warehouse_location', 'Warehouse'), col('stock', 'Stock'), col('is_active', 'Active')],
  },
  users: {
    roles: ['SUPER_ADMIN'],
    sql: `SELECT u.email, u.role, u.phone, u.is_active, COALESCE(s.company_name, b.company_name) AS company, u.created_at
          FROM users u LEFT JOIN sellers s ON s.user_id = u.id LEFT JOIN buyers b ON b.user_id = u.id ORDER BY u.created_at DESC`,
    columns: [col('email', 'Email'), col('role', 'Role'), col('phone', 'Phone'), col('is_active', 'Active'), col('company', 'Company'), col('created_at', 'Joined')],
  },
  'audit-logs': {
    roles: ['SUPER_ADMIN'],
    sql: `SELECT a.created_at, u.email AS user_email, a.action, a.entity_type, a.entity_id, a.metadata
          FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 5000`,
    columns: [col('created_at', 'When'), col('user_email', 'User'), col('action', 'Action'), col('entity_type', 'Entity'), col('entity_id', 'Entity ID'), col('metadata', 'Details')],
  },
};

router.get('/:dataset', asyncHandler(async (req, res) => {
  const ds = DATASETS[req.params.dataset];
  if (!ds) throw new NotFoundError('Unknown export');
  if (!ds.roles.includes(req.user.role)) return res.status(403).json({ message: `This export requires one of: ${ds.roles.join(', ')}` });
  const { rows } = await pool.query(ds.sql);
  await logAction({ userId: req.user.id, action: 'EXPORT_CSV', entityType: 'Export', entityId: req.params.dataset, metadata: { rows: rows.length } });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ctech-${req.params.dataset}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('﻿' + toCsv(ds.columns, rows)); // BOM so Excel reads UTF-8 (₹, names) correctly
}));

module.exports = router;
