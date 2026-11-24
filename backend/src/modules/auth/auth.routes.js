const express = require('express');
const controller = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { createUploader } = require('../../middleware/upload');
const { asyncHandler } = require('../../middleware/error');
const { BadRequestError } = require('../../utils/errors');
const { authLimiter, otpLimiter } = require('../../middleware/rate-limit');
const {
  registerSchema,
  buyerRegisterSchema,
  sellerRegisterSchema,
  loginSchema,
  verify2FaLoginSchema,
  refreshSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  sendOtpSchema,
  changePasswordSchema,
  enable2FaSchema,
  disable2FaSchema,
} = require('./auth.schemas');

const router = express.Router();
const uploadSellerDoc = createUploader('seller-docs');

// Public Auth Endpoints
router.post('/register', validate(registerSchema), controller.register);
router.post('/register/buyer', validate(buyerRegisterSchema), controller.registerBuyer);
router.post('/register/seller', validate(sellerRegisterSchema), controller.registerSeller);

// Onboarding document upload (saves physical file to uploads/seller-docs)
router.post('/upload-doc', uploadSellerDoc.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('No file uploaded');
  const fileUrl = `/uploads/seller-docs/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
    storedName: req.file.filename,
  });
}));

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/login/2fa', authLimiter, validate(verify2FaLoginSchema), controller.verify2FaLogin);
router.post('/refresh', authLimiter, validate(refreshSchema), controller.refresh);

// OTP & Password Recovery
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), controller.sendOtp);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), controller.resetPassword);

// Protected Security & Session Management (requires login)
router.get('/me', authenticate, controller.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);

// 2FA Management
router.post('/2fa/setup', authenticate, controller.setup2Fa);
router.post('/2fa/enable', authenticate, validate(enable2FaSchema), controller.enable2Fa);
router.post('/2fa/disable', authenticate, validate(disable2FaSchema), controller.disable2Fa);

// Active Sessions
router.get('/sessions', authenticate, controller.getActiveSessions);
router.delete('/sessions/:id', authenticate, controller.revokeSession);
router.post('/sessions/revoke-others', authenticate, controller.revokeAllOtherSessions);

module.exports = router;
