const express = require('express');
const controller = require('./payments.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createPaymentSchema, createPayoutSchema } = require('./payments.schemas');

const router = express.Router();

router.use(authenticate, requireRole('SUPER_ADMIN', 'TRADER_STAFF'));

router.get('/', controller.findAll);
router.get('/payouts', controller.findAllPayouts);
router.post('/', validate(createPaymentSchema), controller.create);
router.get('/invoice/:invoiceId', controller.findForInvoice);

router.post('/payouts/order/:poId', validate(createPayoutSchema), controller.createPayout);
router.get('/payouts/order/:poId', controller.findPayoutsForOrder);

module.exports = router;
