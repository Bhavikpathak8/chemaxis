const express = require('express');
const controller = require('./chemicals.controller');
const { validate, validateQuery } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createUploader } = require('../../middleware/upload');
const {
  createChemicalSchema,
  updateChemicalSchema,
  updateStockSchema,
  setPriceSchema,
  catalogQuerySchema,
} = require('./chemicals.schemas');

const router = express.Router();
const uploadCoa = createUploader('coa');
const uploadMsds = createUploader('msds');

router.use(authenticate);

// --- Seller ---
router.post('/', requireRole('SELLER'), validate(createChemicalSchema), controller.create);
router.get('/mine', requireRole('SELLER'), controller.findMine);
router.get('/mine/:id', requireRole('SELLER'), controller.findOneOwned);
router.patch('/mine/:id', requireRole('SELLER'), validate(updateChemicalSchema), controller.update);
router.patch(
  '/mine/:id/inventory',
  requireRole('SELLER'),
  validate(updateStockSchema),
  controller.updateStock,
);
router.patch('/mine/:id/deactivate', requireRole('SELLER'), controller.deactivate);

// Document type determines which multer instance handles it — keeps COA and
// MSDS files in separate folders on disk without extra branching logic.
router.post(
  '/mine/:id/documents',
  requireRole('SELLER'),
  (req, res, next) => {
    const uploader = req.query.type === 'MSDS' ? uploadMsds : uploadCoa;
    uploader.single('file')(req, res, next);
  },
  controller.uploadDocument,
);

// --- Admin/Staff ---
router.get('/admin/all', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), controller.findAllForAdmin);
router.patch(
  '/admin/:id/price',
  requireRole('SUPER_ADMIN', 'TRADER_STAFF'),
  validate(setPriceSchema),
  controller.setPrice,
);

router.delete('/admin/:id', requireRole('SUPER_ADMIN'), controller.remove);

// --- Buyer catalog ---
router.get(
  '/catalog',
  requireRole('BUYER'),
  validateQuery(catalogQuerySchema),
  controller.findCatalog,
);
router.get('/catalog/:id', requireRole('BUYER'), controller.findCatalogItem);

module.exports = router;
