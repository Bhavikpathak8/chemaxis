const sellersService = require('./sellers.service');
const { asyncHandler } = require('../../middleware/error');
const { fileUrlFor } = require('../../middleware/upload');
const { BadRequestError } = require('../../utils/errors');

const getMyProfile = asyncHandler(async (req, res) => {
  res.json(await sellersService.getMyProfile(req.user.id));
});

const updateMyProfile = asyncHandler(async (req, res) => {
  res.json(await sellersService.updateMyProfile(req.user.id, req.body));
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('No file uploaded');
  const type = req.query.type;
  const allowed = [
    'GST_CERTIFICATE',
    'COMPANY_LICENSE',
    'PAN_CARD',
    'ADDRESS_PROOF',
    'FACTORY_LICENSE',
    'OTHER',
  ];
  if (!allowed.includes(type)) {
    throw new BadRequestError(`type query param must be one of: ${allowed.join(', ')}`);
  }
  const fileUrl = fileUrlFor('seller-docs', req.file.filename);
  res.status(201).json(await sellersService.attachCompanyDocument(req.user.id, type, fileUrl));
});

const resubmitVerification = asyncHandler(async (req, res) => {
  res.json(await sellersService.resubmitVerification(req.user.id, req.body));
});

const getMyOrderHistory = asyncHandler(async (req, res) => {
  res.json(await sellersService.getMyOrderHistory(req.user.id));
});

const getMyPaymentHistory = asyncHandler(async (req, res) => {
  res.json(await sellersService.getMyPaymentHistory(req.user.id));
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadDocument,
  resubmitVerification,
  getMyOrderHistory,
  getMyPaymentHistory,
};
