const express = require('express');
const controller = require('./transportation.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createUploader } = require('../../middleware/upload');
const { assignTransportSchema, updateStatusSchema } = require('./transportation.schemas');

const router = express.Router();
const uploadPod = createUploader('pod');

router.use(authenticate);

// --- Admin/Trader ---
router.post(
  '/order/:poId',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  validate(assignTransportSchema),
  controller.assign,
);
router.patch(
  '/:id/status',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  validate(updateStatusSchema),
  controller.updateStatus,
);
router.post(
  '/:id/pod',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  uploadPod.single('file'),
  controller.attachPod,
);
router.get('/order/:poId', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findForOrder);
router.get('/', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findAll);

// --- Buyer (shipment tracking) ---
router.get('/mine', requireRole('BUYER'), controller.findAllForBuyer);
router.get('/mine/order/:poId', requireRole('BUYER'), controller.findForOrderAsBuyer);

module.exports = router;
