const express = require('express');
const service = require('./audit-logs.service');
const { asyncHandler } = require('../../middleware/error');
const { authenticate, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/', asyncHandler(async (req, res) => {
  const { entityType, userId, action } = req.query;
  res.json(await service.find({ entityType, userId, action }));
}));

module.exports = router;
