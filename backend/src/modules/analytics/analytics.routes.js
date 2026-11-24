const express = require('express');
const { z } = require('zod');
const service = require('./analytics.service');
const { asyncHandler } = require('../../middleware/error');
const { authenticate, requireRole } = require('../../middleware/auth');
const { validateQuery } = require('../../middleware/validate');

const router = express.Router();
router.use(authenticate);

const ADMIN = ['SUPER_ADMIN', 'TRADER_STAFF'];
const rangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD').optional(),
  limit: z.coerce.number().int().positive().max(20).optional(),
});

router.get('/trader/dashboard', requireRole(...ADMIN), asyncHandler(async (req, res) => res.json(await service.traderDashboard())));
router.get('/summary', requireRole(...ADMIN), validateQuery(rangeSchema), asyncHandler(async (req, res) => res.json(await service.summary(req.query))));
router.get('/top', requireRole(...ADMIN), validateQuery(rangeSchema), asyncHandler(async (req, res) => res.json(await service.topLists(req.query))));
router.get('/pending-payments', requireRole(...ADMIN), asyncHandler(async (req, res) => res.json(await service.pendingPayments())));
router.get('/transactions', requireRole(...ADMIN), validateQuery(rangeSchema), asyncHandler(async (req, res) => res.json(await service.transactions(req.query))));
router.get('/chemicals/:id', requireRole(...ADMIN), asyncHandler(async (req, res) => res.json(await service.chemicalDetailForAdmin(req.params.id))));
router.get('/platform', requireRole('SUPER_ADMIN'), asyncHandler(async (req, res) => res.json(await service.platform())));
router.get('/seller/overview', requireRole('SELLER'), asyncHandler(async (req, res) => res.json(await service.sellerOverview(req.user.id))));
router.get('/buyer/overview', requireRole('BUYER'), asyncHandler(async (req, res) => res.json(await service.buyerOverview(req.user.id))));

module.exports = router;
