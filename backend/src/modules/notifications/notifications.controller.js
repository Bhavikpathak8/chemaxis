const service = require('./notifications.service');
const { asyncHandler } = require('../../middleware/error');

const findMine = asyncHandler(async (req, res) => res.json(await service.findMine(req.user.id)));
const markRead = asyncHandler(async (req, res) => res.json(await service.markRead(req.user.id, req.params.id)));
const markAllRead = asyncHandler(async (req, res) => res.json(await service.markAllRead(req.user.id)));

module.exports = { findMine, markRead, markAllRead };
