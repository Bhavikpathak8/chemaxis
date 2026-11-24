const express = require('express');
const controller = require('./invoices.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { generateInvoiceSchema } = require('./invoices.schemas');

const router = express.Router();

router.use(authenticate);

// --- Admin/Trader ---
router.post(
  '/order/:poId',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  validate(generateInvoiceSchema),
  controller.generateForOrder,
);
router.get('/', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findAll);
// Declared before '/:id' so "mine" is never parsed as an invoice id.
router.get('/mine', requireRole('BUYER'), controller.findAllForBuyer);
router.get('/:id', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findOne);

// --- Buyer ---
router.get('/mine/order/:poId', requireRole('BUYER'), controller.findForBuyerOrder);

module.exports = router;
