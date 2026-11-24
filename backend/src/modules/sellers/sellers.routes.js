const express = require('express');
const controller = require('./sellers.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createUploader } = require('../../middleware/upload');
const { updateSellerProfileSchema } = require('./sellers.schemas');

const router = express.Router();
const uploadSellerDoc = createUploader('seller-docs');

router.use(authenticate, requireRole('SELLER'));

router.get('/me', controller.getMyProfile);
router.patch('/me', validate(updateSellerProfileSchema), controller.updateMyProfile);
router.post('/me/resubmit', controller.resubmitVerification);
router.post('/me/documents', uploadSellerDoc.single('file'), controller.uploadDocument);
router.get('/me/orders', controller.getMyOrderHistory);
router.get('/me/payments', controller.getMyPaymentHistory);

module.exports = router;
