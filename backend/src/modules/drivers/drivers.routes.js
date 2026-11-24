const express = require('express');
const controller = require('./drivers.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createDriverSchema, updateDriverSchema } = require('./drivers.schemas');

const router = express.Router();

router.use(authenticate, requireRole('SUPER_ADMIN', 'TRADER_STAFF'));

router.post('/', validate(createDriverSchema), controller.create);
router.get('/', controller.findAll);
router.patch('/:id', validate(updateDriverSchema), controller.update);

module.exports = router;
