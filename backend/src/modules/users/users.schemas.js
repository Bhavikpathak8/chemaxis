const { z } = require('zod');

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'TRADER_STAFF']).optional(),
});

const listUsersQuery = z.object({
  role: z.enum(['SUPER_ADMIN', 'TRADER_STAFF', 'SELLER', 'BUYER']).optional(),
  status: z.enum(['active', 'banned']).optional(),
  search: z.string().max(100).optional(),
});

const statusQuery = z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional() });
const gstVerifySchema = z.object({ verified: z.boolean() });

module.exports = { createStaffSchema, listUsersQuery, statusQuery, gstVerifySchema };
