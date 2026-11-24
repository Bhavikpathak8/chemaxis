const authService = require('./auth.service');
const { asyncHandler } = require('../../middleware/error');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const registerBuyer = asyncHandler(async (req, res) => {
  const result = await authService.registerBuyer(req.body);
  res.status(201).json(result);
});

const registerSeller = asyncHandler(async (req, res) => {
  const result = await authService.registerSeller(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const identifier = req.body.identifier || req.body.email;
  const result = await authService.login(identifier, req.body.password, ip, userAgent);
  res.json(result);
});

const verify2FaLogin = asyncHandler(async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const result = await authService.verify2FaLogin({
    tempToken: req.body.tempToken,
    code: req.body.code,
    backupCode: req.body.backupCode,
    ipAddress: ip,
    userAgent,
  });
  res.json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const sendOtp = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier || req.body.email;
  const result = await authService.sendOtp(identifier, req.body.purpose || 'EMAIL_VERIFY');
  res.json(result);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier || req.body.email;
  const result = await authService.verifyOtp(identifier, req.body.otp, req.body.purpose || 'EMAIL_VERIFY');
  res.json(result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const identifier = req.body.email;
  const result = await authService.forgotPassword(identifier);
  res.json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
  const identifier = req.body.email;
  const result = await authService.resetPassword(identifier, req.body.otp, req.body.newPassword);
  res.json(result);
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.json(result);
});

const setup2Fa = asyncHandler(async (req, res) => {
  const result = await authService.setup2Fa(req.user.id);
  res.json(result);
});

const enable2Fa = asyncHandler(async (req, res) => {
  const result = await authService.enable2Fa(req.user.id, req.body.secret, req.body.code);
  res.json(result);
});

const disable2Fa = asyncHandler(async (req, res) => {
  const result = await authService.disable2Fa(req.user.id, req.body.currentPassword);
  res.json(result);
});

const getActiveSessions = asyncHandler(async (req, res) => {
  const result = await authService.getActiveSessions(req.user.id);
  res.json(result);
});

const revokeSession = asyncHandler(async (req, res) => {
  const result = await authService.revokeSession(req.user.id, req.params.id);
  res.json(result);
});

const revokeAllOtherSessions = asyncHandler(async (req, res) => {
  const result = await authService.revokeAllOtherSessions(req.user.id, req.user.sessionId);
  res.json(result);
});

module.exports = {
  register,
  registerBuyer,
  registerSeller,
  login,
  verify2FaLogin,
  refresh,
  me,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  setup2Fa,
  enable2Fa,
  disable2Fa,
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
};
