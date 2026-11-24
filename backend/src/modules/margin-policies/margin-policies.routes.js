const express = require('express');
const service = require('./margin-policies.service');
const { asyncHandler } = require('../../middleware/error');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createMarginPolicySchema, updateMarginPolicySchema } = require('./margin-policies.schemas');

const router = express.Router();
router.use(authenticate);

// Trader staff use this from the pricing screen; everything else is Super Admin.
router.get('/suggest/:chemicalId', requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  asyncHandler(async (req, res) => res.json(await service.suggestForChemical(req.params.chemicalId))));

router.use(requireRole('SUPER_ADMIN'));

router.get('/', asyncHandler(async (req, res) => res.json(await service.list())));
router.post('/', validate(createMarginPolicySchema), asyncHandler(async (req, res) =>
  res.status(201).json(await service.create(req.user.id, req.body))));
router.patch('/:id', validate(updateMarginPolicySchema), asyncHandler(async (req, res) =>
  res.json(await service.update(req.user.id, req.params.id, req.body))));

module.exports = router;
