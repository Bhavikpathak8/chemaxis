const { NotFoundError } = require('../../utils/errors');
const service = require('./transportation.service');
const { asyncHandler } = require('../../middleware/error');
const { fileUrlFor } = require('../../middleware/upload');
const { BadRequestError } = require('../../utils/errors');

const assign = asyncHandler(async (req, res) => {
  res.status(201).json(await service.assign(req.params.poId, req.body));
});

const updateStatus = asyncHandler(async (req, res) => {
  res.json(await service.updateStatus(req.params.id, req.body));
});

const attachPod = asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('No file uploaded');
  const fileUrl = fileUrlFor('pod', req.file.filename);
  res.status(201).json(await service.attachPod(req.params.id, fileUrl));
});

const findForOrder = asyncHandler(async (req, res) => {
  // The trader's order desk asks before transport exists, which is a normal state, not an error.
  try { res.json(await service.findForOrder(req.params.poId)); } catch (err) {
    if (err instanceof NotFoundError) return res.json(null);
    throw err;
  }
});

const findForOrderAsBuyer = asyncHandler(async (req, res) => {
  res.json(await service.findForOrderAsBuyer(req.user.id, req.params.poId));
});

const findAllForBuyer = asyncHandler(async (req, res) => {
  res.json(await service.findAllForBuyer(req.user.id));
});

const findAll = asyncHandler(async (req, res) => {
  res.json(await service.findAll());
});

module.exports = { assign, updateStatus, attachPod, findForOrder, findForOrderAsBuyer, findAllForBuyer, findAll };
