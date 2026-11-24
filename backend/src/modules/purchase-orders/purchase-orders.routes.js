const express = require('express');
const controller = require('./purchase-orders.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticate);

// --- Buyer ---
router.get('/mine', requireRole('BUYER'), controller.findMineForBuyer);
router.get('/mine/:id', requireRole('BUYER'), controller.findOneOwnedByBuyer);
router.patch('/mine/:id/cancel', requireRole('BUYER'), controller.cancelByBuyer);

// --- Admin/Trader ---
router.get('/admin/all', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findAllForAdmin);
router.get('/admin/:id', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findOneForAdmin);
router.patch('/admin/:id/confirm', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.confirmByAdmin);
router.patch('/admin/:id/cancel', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.cancelByAdmin);

module.exports = router;
