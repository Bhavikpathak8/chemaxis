const quotationsService = require('./quotations.service');
const { asyncHandler } = require('../../middleware/error');

// --- Buyer ---
const createRequest = asyncHandler(async (req, res) => {
  res.status(201).json(await quotationsService.createRequest(req.user.id, req.body));
});

const findMine = asyncHandler(async (req, res) => {
  res.json(await quotationsService.findMine(req.user.id));
});

const findOneOwned = asyncHandler(async (req, res) => {
  res.json(await quotationsService.findOneOwned(req.user.id, req.params.id));
});

const rejectByBuyer = asyncHandler(async (req, res) => {
  res.json(await quotationsService.rejectByBuyer(req.user.id, req.params.id));
});

const acceptByBuyer = asyncHandler(async (req, res) => {
  res.status(201).json(await quotationsService.acceptByBuyer(req.user.id, req.params.id, req.body));
});

// --- Admin/Trader ---
const findAllForAdmin = asyncHandler(async (req, res) => {
  res.json(await quotationsService.findAllForAdmin());
});

const createQuotationDraft = asyncHandler(async (req, res) => {
  res.status(201).json(await quotationsService.createQuotationDraft(req.params.id, req.body));
});

const updateQuotationDraft = asyncHandler(async (req, res) => {
  res.json(await quotationsService.updateQuotationDraft(req.params.quotationId, req.body));
});

const sendQuotation = asyncHandler(async (req, res) => {
  res.json(await quotationsService.sendQuotation(req.params.quotationId));
});

module.exports = {
  createRequest,
  findMine,
  findOneOwned,
  rejectByBuyer,
  acceptByBuyer,
  findAllForAdmin,
  createQuotationDraft,
  updateQuotationDraft,
  sendQuotation,
};
