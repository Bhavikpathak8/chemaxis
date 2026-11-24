const { z } = require('zod');

const base = z.object({
  name: z.string().min(1).max(120),
  scope: z.enum(['GLOBAL', 'CATEGORY', 'CHEMICAL']).default('GLOBAL'),
  category: z.string().min(1).optional(),
  chemicalId: z.string().uuid().optional(),
  marginType: z.enum(['FIXED', 'PERCENTAGE', 'MANUAL']),
  marginValue: z.coerce.number().positive(),
  isActive: z.boolean().optional(),
});

const createMarginPolicySchema = base
  .refine((d) => d.scope !== 'CATEGORY' || !!d.category, { message: 'category is required when scope is CATEGORY', path: ['category'] })
  .refine((d) => d.scope !== 'CHEMICAL' || !!d.chemicalId, { message: 'chemicalId is required when scope is CHEMICAL', path: ['chemicalId'] });

const updateMarginPolicySchema = base.partial();

module.exports = { createMarginPolicySchema, updateMarginPolicySchema };
