const express = require('express');
const controller = require('./buyers.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { updateBuyerProfileSchema } = require('./buyers.schemas');

const router = express.Router();

router.use(authenticate, requireRole('BUYER'));

router.get('/me', controller.getMyProfile);
router.patch('/me', validate(updateBuyerProfileSchema), controller.updateMyProfile);
router.get('/me/orders', controller.getMyOrderHistory);
router.get('/me/payments', controller.getMyPaymentHistory);

module.exports = router;
