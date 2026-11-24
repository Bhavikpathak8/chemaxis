const buyersService = require('./buyers.service');
const { asyncHandler } = require('../../middleware/error');

const getMyProfile = asyncHandler(async (req, res) => {
  res.json(await buyersService.getMyProfile(req.user.id));
});

const updateMyProfile = asyncHandler(async (req, res) => {
  res.json(await buyersService.updateMyProfile(req.user.id, req.body));
});

const getMyOrderHistory = asyncHandler(async (req, res) => {
  res.json(await buyersService.getMyOrderHistory(req.user.id));
});

const getMyPaymentHistory = asyncHandler(async (req, res) => {
  res.json(await buyersService.getMyPaymentHistory(req.user.id));
});

module.exports = { getMyProfile, updateMyProfile, getMyOrderHistory, getMyPaymentHistory };
