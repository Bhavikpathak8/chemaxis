const express = require('express');
const controller = require('./transport-vendors.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createVendorSchema, updateVendorSchema } = require('./transport-vendors.schemas');

const router = express.Router();

router.use(authenticate, requireRole('SUPER_ADMIN', 'TRADER_STAFF'));

router.post('/', validate(createVendorSchema), controller.create);
router.get('/', controller.findAll);
router.patch('/:id', validate(updateVendorSchema), controller.update);

module.exports = router;
