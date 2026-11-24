const { z } = require('zod');

const createRfqSchema = z.object({
  chemicalId: z.string().uuid(),
  requestedQuantity: z.coerce.number().positive(),
  unit: z.enum(['KG', 'TON', 'LITRE']),
});

// Trader creating/editing a DRAFT quotation. Quantity and price can differ
// from the buyer's original request — "Trader edits quantity/price."
const quotationDraftSchema = z.object({
  quotedPricePerUnit: z.coerce.number().positive(),
  quantity: z.coerce.number().positive(),
  validUntil: z.string().datetime().or(z.string().date()),
});

const updateQuotationDraftSchema = quotationDraftSchema.partial();

const acceptRfqSchema = z.object({
  deliveryAddress: z.string().min(1),
  expectedDispatchDate: z.string().optional(),
  paymentTerms: z.string().optional(),
});

module.exports = {
  createRfqSchema,
  quotationDraftSchema,
  updateQuotationDraftSchema,
  acceptRfqSchema,
};
