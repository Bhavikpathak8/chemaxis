const { z } = require('zod');

const casRegex = /^\d{2,7}-\d{2}-\d$/;

const createChemicalSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80).optional(),
  casNumber: z.string().refine((val) => !val || casRegex.test(val), {
    message: 'Invalid CAS registry number format. Expected format: XX...X-XX-X (e.g. 108-95-2)',
  }).optional().nullable(),
  purity: z.string().min(1),
  unit: z.enum(['KG', 'TON', 'LITRE']),
  sellerPrice: z.coerce.number().positive(),
  warehouseLocation: z.string().min(1),
  description: z.string().optional(),
  availableQuantity: z.coerce.number().positive(),
  grade: z.string().optional().nullable(),
  hazardClass: z.string().optional().nullable(),
  unNumber: z.string().optional().nullable(),
  packingGroup: z.string().optional().nullable(),
  packagingType: z.string().optional().nullable(),
  moq: z.coerce.number().positive().optional().nullable(),
});

const updateChemicalSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(80).optional(),
  casNumber: z.string().refine((val) => !val || casRegex.test(val), {
    message: 'Invalid CAS registry number format. Expected format: XX...X-XX-X (e.g. 108-95-2)',
  }).optional().nullable(),
  purity: z.string().min(1).optional(),
  unit: z.enum(['KG', 'TON', 'LITRE']).optional(),
  sellerPrice: z.coerce.number().positive().optional(),
  warehouseLocation: z.string().min(1).optional(),
  description: z.string().optional(),
  grade: z.string().optional().nullable(),
  hazardClass: z.string().optional().nullable(),
  unNumber: z.string().optional().nullable(),
  packingGroup: z.string().optional().nullable(),
  packagingType: z.string().optional().nullable(),
  moq: z.coerce.number().positive().optional().nullable(),
});

const updateStockSchema = z.object({
  quantityAvailable: z.coerce.number().nonnegative(),
});

const setPriceSchema = z.object({
  marginType: z.enum(['FIXED', 'PERCENTAGE', 'MANUAL']),
  marginValue: z.coerce.number(),
});

const catalogQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  grade: z.string().optional(),
  hazardClass: z.string().optional(),
  unit: z.enum(['KG', 'TON', 'LITRE']).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

module.exports = {
  createChemicalSchema,
  updateChemicalSchema,
  updateStockSchema,
  setPriceSchema,
  catalogQuerySchema,
};
