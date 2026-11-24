const { z } = require('zod');

const updateBuyerProfileSchema = z.object({
  companyName: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pincode: z.string().min(1).optional(),
});

module.exports = { updateBuyerProfileSchema };
