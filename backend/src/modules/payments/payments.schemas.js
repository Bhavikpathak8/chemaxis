const { z } = require('zod');

// Admin records a payment the buyer has already made (bank transfer, UPI,
// etc.) — recording it IS the verification step here, so it's created
// directly as PAID rather than going through a separate confirm action.
const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  method: z.enum(['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'OTHER']),
  referenceNote: z.string().optional(),
});

const createPayoutSchema = z.object({
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
});

module.exports = { createPaymentSchema, createPayoutSchema };
