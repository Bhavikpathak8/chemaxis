const usersService = require('./users.service');
const { asyncHandler } = require('../../middleware/error');
const { logAction } = require('../../common/audit-log');

const getPendingSellers = asyncHandler(async (req, res) => {
  res.json(await usersService.findPendingSellers());
});

const getPendingBuyers = asyncHandler(async (req, res) => {
  res.json(await usersService.findPendingBuyers());
});

const approveSeller = asyncHandler(async (req, res) => {
  const result = await usersService.setSellerVerification(req.params.id, 'APPROVED', null, req.user.id);
  await logAction({ userId: req.user.id, action: 'APPROVE_SELLER', entityType: 'Seller', entityId: req.params.id });
  res.json(result);
});

const rejectSeller = asyncHandler(async (req, res) => {
  const result = await usersService.setSellerVerification(req.params.id, 'REJECTED', req.body.reason, req.user.id);
  await logAction({
    userId: req.user.id,
    action: 'REJECT_SELLER',
    entityType: 'Seller',
    entityId: req.params.id,
    metadata: { reason: req.body.reason },
  });
  res.json(result);
});

const approveBuyer = asyncHandler(async (req, res) => {
  const result = await usersService.setBuyerVerification(req.params.id, 'APPROVED', null, req.user.id);
  await logAction({ userId: req.user.id, action: 'APPROVE_BUYER', entityType: 'Buyer', entityId: req.params.id });
  res.json(result);
});

const rejectBuyer = asyncHandler(async (req, res) => {
  const result = await usersService.setBuyerVerification(req.params.id, 'REJECTED', req.body.reason, req.user.id);
  await logAction({
    userId: req.user.id,
    action: 'REJECT_BUYER',
    entityType: 'Buyer',
    entityId: req.params.id,
    metadata: { reason: req.body.reason },
  });
  res.json(result);
});

const deactivate = asyncHandler(async (req, res) => {
  const result = await usersService.deactivateUser(req.params.id, req.user.id);
  await logAction({ userId: req.user.id, action: 'BAN_USER', entityType: 'User', entityId: req.params.id });
  res.json(result);
});

const activate = asyncHandler(async (req, res) => {
  const result = await usersService.activateUser(req.params.id);
  await logAction({ userId: req.user.id, action: 'UNBAN_USER', entityType: 'User', entityId: req.params.id });
  res.json(result);
});

const list = asyncHandler(async (req, res) => res.json(await usersService.listUsers(req.query)));
const listSellers = asyncHandler(async (req, res) => res.json(await usersService.listSellers(req.query.status)));
const listBuyers = asyncHandler(async (req, res) => res.json(await usersService.listBuyers(req.query.status)));
const sellerDocuments = asyncHandler(async (req, res) => res.json(await usersService.sellerDocuments(req.params.id)));

const gstVerify = (kind) => asyncHandler(async (req, res) => {
  const result = await usersService.setGstVerified(kind, req.params.id, req.body.verified);
  await logAction({ userId: req.user.id, action: req.body.verified ? 'VERIFY_GST' : 'UNVERIFY_GST', entityType: kind === 'seller' ? 'Seller' : 'Buyer', entityId: req.params.id });
  res.json(result);
});

const createStaff = asyncHandler(async (req, res) => {
  const staff = await usersService.createStaff(req.body);
  await logAction({ userId: req.user.id, action: 'CREATE_STAFF', entityType: 'User', entityId: staff.id, metadata: { email: staff.email, role: staff.role } });
  res.status(201).json(staff);
});

module.exports = {
  getPendingSellers,
  getPendingBuyers,
  approveSeller,
  rejectSeller,
  approveBuyer,
  rejectBuyer,
  deactivate,
  activate,
  list,
  listSellers,
  listBuyers,
  sellerDocuments,
  gstVerify,
  createStaff,
};
