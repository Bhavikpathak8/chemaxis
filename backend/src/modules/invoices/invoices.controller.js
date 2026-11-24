const service = require('./invoices.service');
const { asyncHandler } = require('../../middleware/error');

const generateForOrder = asyncHandler(async (req, res) => {
  res.status(201).json(await service.generateForOrder(req.params.poId, req.body));
});

const findAll = asyncHandler(async (req, res) => {
  res.json(await service.findAll());
});

const findOne = asyncHandler(async (req, res) => {
  res.json(await service.findOne(req.params.id));
});

const findForBuyerOrder = asyncHandler(async (req, res) => {
  res.json(await service.findForBuyerOrder(req.user.id, req.params.poId));
});

const findAllForBuyer = asyncHandler(async (req, res) => {
  res.json(await service.findAllForBuyer(req.user.id));
});

module.exports = { findAllForBuyer, generateForOrder, findAll, findOne, findForBuyerOrder };
