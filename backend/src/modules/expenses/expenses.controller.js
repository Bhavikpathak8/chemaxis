const service = require('./expenses.service');
const { asyncHandler } = require('../../middleware/error');

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.create(req.body));
});

const findForOrder = asyncHandler(async (req, res) => {
  res.json(await service.findForOrder(req.params.poId));
});

const findCategories = asyncHandler(async (req, res) => {
  res.json(await service.findCategories());
});

const findAll = asyncHandler(async (req, res) => res.json(await service.findAll()));

module.exports = { findAll, create, findForOrder, findCategories };
