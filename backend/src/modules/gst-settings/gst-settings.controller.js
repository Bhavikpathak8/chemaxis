const service = require('./gst-settings.service');
const { asyncHandler } = require('../../middleware/error');

const get = asyncHandler(async (req, res) => {
  res.json(await service.get());
});

const update = asyncHandler(async (req, res) => {
  res.json(await service.update(req.body.defaultGstRatePercent));
});

module.exports = { get, update };
