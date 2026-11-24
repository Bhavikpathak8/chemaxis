const service = require('./drivers.service');
const { asyncHandler } = require('../../middleware/error');

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.create(req.body));
});

const findAll = asyncHandler(async (req, res) => {
  res.json(await service.findAll());
});

const update = asyncHandler(async (req, res) => {
  res.json(await service.update(req.params.id, req.body));
});

module.exports = { create, findAll, update };
