const { z } = require('zod');

const updateGstSettingsSchema = z.object({
  defaultGstRatePercent: z.coerce.number().nonnegative(),
});

module.exports = { updateGstSettingsSchema };
