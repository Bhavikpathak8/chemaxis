const { z } = require('zod');

const createDriverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
  vendorId: z.string().uuid().optional(),
});

const updateDriverSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
  vendorId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createDriverSchema, updateDriverSchema };
