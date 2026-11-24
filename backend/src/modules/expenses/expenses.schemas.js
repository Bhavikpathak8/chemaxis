const { z } = require('zod');

const createExpenseSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  categoryName: z.string().min(1), // e.g. "Billing", "Loading", "Packaging", "Insurance", "Commission", "Miscellaneous"
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
});

module.exports = { createExpenseSchema };
