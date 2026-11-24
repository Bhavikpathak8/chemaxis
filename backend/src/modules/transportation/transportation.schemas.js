const { z } = require('zod');

const assignTransportSchema = z.object({
  pickupLocation: z.string().min(1),
  deliveryLocation: z.string().min(1),
  distanceKm: z.coerce.number().positive().optional(),
  vehicleType: z.string().min(1),
  cost: z.coerce.number().positive(),
  vendorId: z.string().uuid().optional(),
});

// driverId/vendorId are accepted here because assigning a driver IS what
// moving to PICKUP_SCHEDULED means in this workflow — no separate endpoint.
const updateStatusSchema = z.object({
  status: z.enum(['PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED']),
  driverId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
});

module.exports = { assignTransportSchema, updateStatusSchema };
