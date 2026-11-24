const express = require('express');
const controller = require('./quotations.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const {
  createRfqSchema,
  quotationDraftSchema,
  updateQuotationDraftSchema,
  acceptRfqSchema,
} = require('./quotations.schemas');

const router = express.Router();

router.use(authenticate);

// --- Buyer ---
router.post('/', requireRole('BUYER'), validate(createRfqSchema), controller.createRequest);
router.get('/mine', requireRole('BUYER'), controller.findMine);
router.get('/mine/:id', requireRole('BUYER'), controller.findOneOwned);
router.patch('/mine/:id/reject', requireRole('BUYER'), controller.rejectByBuyer);
router.post(
  '/mine/:id/accept',
  requireRole('BUYER'),
  validate(acceptRfqSchema),
  controller.acceptByBuyer,
);

// --- Admin/Trader ---
router.get('/admin/all', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findAllForAdmin);
router.post(
  '/admin/:id/quotations',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  validate(quotationDraftSchema),
  controller.createQuotationDraft,
);
router.patch(
  '/admin/quotations/:quotationId',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  validate(updateQuotationDraftSchema),
  controller.updateQuotationDraft,
);
router.post(
  '/admin/quotations/:quotationId/send',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  controller.sendQuotation,
);

module.exports = router;
