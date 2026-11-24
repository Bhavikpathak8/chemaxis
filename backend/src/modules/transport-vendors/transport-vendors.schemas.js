const { z } = require('zod');

const createVendorSchema = z.object({
  name: z.string().min(1),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

const updateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createVendorSchema, updateVendorSchema };
