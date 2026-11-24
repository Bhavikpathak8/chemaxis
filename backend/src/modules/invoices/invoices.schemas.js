const { z } = require('zod');

// Optional override — defaults to the live GST settings rate if omitted.
const generateInvoiceSchema = z.object({
  gstRatePercent: z.coerce.number().nonnegative().optional(),
});

module.exports = { generateInvoiceSchema };
