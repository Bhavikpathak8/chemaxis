const poService = require('./purchase-orders.service');
const { asyncHandler } = require('../../middleware/error');

// --- Buyer ---
const findMineForBuyer = asyncHandler(async (req, res) => {
  res.json(await poService.findMineForBuyer(req.user.id));
});

const findOneOwnedByBuyer = asyncHandler(async (req, res) => {
  res.json(await poService.findOneOwnedByBuyer(req.user.id, req.params.id));
});

const cancelByBuyer = asyncHandler(async (req, res) => {
  res.json(await poService.cancelByBuyer(req.user.id, req.params.id));
});

// --- Admin/Trader ---
const findAllForAdmin = asyncHandler(async (req, res) => {
  res.json(await poService.findAllForAdmin());
});

const findOneForAdmin = asyncHandler(async (req, res) => {
  res.json(await poService.findOneForAdmin(req.params.id));
});

const confirmByAdmin = asyncHandler(async (req, res) => {
  res.json(await poService.confirmByAdmin(req.params.id));
});

const cancelByAdmin = asyncHandler(async (req, res) => {
  res.json(await poService.cancelByAdmin(req.params.id));
});

module.exports = {
  findMineForBuyer,
  findOneOwnedByBuyer,
  cancelByBuyer,
  findAllForAdmin,
  findOneForAdmin,
  confirmByAdmin,
  cancelByAdmin,
};
