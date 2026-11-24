const chemicalsService = require('./chemicals.service');
const { asyncHandler } = require('../../middleware/error');
const { fileUrlFor } = require('../../middleware/upload');
const { BadRequestError } = require('../../utils/errors');
const { logAction } = require('../../common/audit-log');

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await chemicalsService.create(req.user.id, req.body));
});

const findMine = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.findMine(req.user.id));
});

const findOneOwned = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.findOneOwned(req.user.id, req.params.id));
});

const update = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.update(req.user.id, req.params.id, req.body));
});

const updateStock = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.updateStock(req.user.id, req.params.id, req.body.quantityAvailable));
});

const deactivate = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.deactivate(req.user.id, req.params.id));
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('No file uploaded');
  const type = req.query.type;
  if (type !== 'COA' && type !== 'MSDS') {
    throw new BadRequestError('type query param must be COA or MSDS');
  }
  const fileUrl = fileUrlFor(type === 'COA' ? 'coa' : 'msds', req.file.filename);
  res.status(201).json(await chemicalsService.attachDocument(req.user.id, req.params.id, type, fileUrl));
});

const findAllForAdmin = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.findAllForAdmin());
});

const setPrice = asyncHandler(async (req, res) => {
  const chem = await chemicalsService.setBuyerPrice(req.params.id, req.body.marginType, req.body.marginValue);
  await logAction({
    userId: req.user.id, action: 'SET_MARGIN', entityType: 'Chemical', entityId: req.params.id,
    metadata: { marginType: req.body.marginType, marginValue: req.body.marginValue, buyerPrice: chem.buyer_price },
  });
  res.json(chem);
});

const findCatalog = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.findCatalogForBuyers(req.query));
});

const findCatalogItem = asyncHandler(async (req, res) => {
  res.json(await chemicalsService.findOneForBuyer(req.params.id));
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await chemicalsService.deleteChemical(req.params.id);
  await logAction({ userId: req.user.id, action: 'DELETE_CHEMICAL', entityType: 'Chemical', entityId: req.params.id, metadata: { name: deleted.name } });
  res.json({ deleted: true });
});

module.exports = {
  remove,
  create,
  findMine,
  findOneOwned,
  update,
  updateStock,
  deactivate,
  uploadDocument,
  findAllForAdmin,
  setPrice,
  findCatalog,
  findCatalogItem,
};
