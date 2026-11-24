const { z } = require('zod');

// GST number is intentionally not editable here — changing it should go
// through re-verification, not a casual profile edit.
const updateSellerProfileSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactPerson: z.string().min(1).optional(),
  businessType: z.string().min(1).optional(),
  panNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  website: z.string().optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pincode: z.string().min(1).optional(),
});

module.exports = { updateSellerProfileSchema };
