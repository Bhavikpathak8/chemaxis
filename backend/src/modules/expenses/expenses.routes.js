const express = require('express');
const controller = require('./expenses.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createExpenseSchema } = require('./expenses.schemas');

const router = express.Router();

router.use(authenticate, requireRole('SUPER_ADMIN', 'TRADER_STAFF'));

router.get('/', controller.findAll);
router.post('/', validate(createExpenseSchema), controller.create);
router.get('/categories', controller.findCategories);
router.get('/order/:poId', controller.findForOrder);

module.exports = router;
