const express = require('express');
const controller = require('./gst-settings.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { updateGstSettingsSchema } = require('./gst-settings.schemas');

const router = express.Router();

router.use(authenticate, requireRole('SUPER_ADMIN', 'TRADER_STAFF'));

router.get('/', controller.get);
router.patch('/', requireRole('SUPER_ADMIN'), validate(updateGstSettingsSchema), controller.update);

module.exports = router;
