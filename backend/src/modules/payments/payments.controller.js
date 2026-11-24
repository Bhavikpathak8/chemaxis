const service = require('./payments.service');
const { asyncHandler } = require('../../middleware/error');

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.create(req.body, req.user.id));
});

const findForInvoice = asyncHandler(async (req, res) => {
  res.json(await service.findForInvoice(req.params.invoiceId));
});

const createPayout = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createPayout(req.params.poId, req.body));
});

const findPayoutsForOrder = asyncHandler(async (req, res) => {
  res.json(await service.findPayoutsForOrder(req.params.poId));
});

const findAll = asyncHandler(async (req, res) => res.json(await service.findAll()));
const findAllPayouts = asyncHandler(async (req, res) => res.json(await service.findAllPayouts()));

module.exports = { findAll, findAllPayouts, create, findForInvoice, createPayout, findPayoutsForOrder };
