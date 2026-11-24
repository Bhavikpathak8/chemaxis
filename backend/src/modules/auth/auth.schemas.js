const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(['SELLER', 'BUYER']).optional(),
  fullName: z.string().optional(),
  companyName: z.string().min(1),
  businessType: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  website: z.string().optional(),
});

const buyerRegisterSchema = z.object({
  fullName: z.string().min(2, 'Contact person full name is required'),
  email: z.string().email('Invalid business email address'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  companyName: z.string().min(2, 'Company legal name is required'),
  businessType: z.string().min(2, 'Please select your business type'),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  address: z.string().min(3, 'Registered business address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit postal pincode required'),
  password: z.string().min(8, 'Password must be at least 8 characters with upper, lower, number and special char'),
});

const sellerRegisterSchema = z.object({
  fullName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid business email address'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  companyName: z.string().min(2, 'Company legal name is required'),
  businessType: z.string().min(2, 'Please select your business type'),
  gstNumber: z.string().min(15, 'Valid 15-character GSTIN is required').max(15),
  panNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  address: z.string().min(3, 'Registered address / manufacturing plant address required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit postal pincode required'),
  website: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters with security complexity'),
  documents: z.array(
    z.object({
      type: z.string(),
      fileUrl: z.string(),
      name: z.string().optional(),
    }),
  ).optional(),
}).refine((d) => d.contactPerson || d.fullName, {
  message: 'Contact person full name is required',
});

const loginSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
}).refine((d) => d.email || d.identifier, {
  message: 'Email or mobile number is required',
});

const verify2FaLoginSchema = z.object({
  tempToken: z.string().min(1, 'Temporary 2FA token is required'),
  code: z.string().optional(),
  backupCode: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email or mobile number is required'),
});

const sendOtpSchema = z.object({
  identifier: z.string().min(1).optional(),
  email: z.string().optional(),
  purpose: z.string().optional(),
});

const verifyOtpSchema = z.object({
  identifier: z.string().min(1).optional(),
  email: z.string().optional(),
  otp: z.string().min(4).max(8),
  purpose: z.string().optional(),
});

const resetPasswordSchema = z.object({
  email: z.string().min(1),
  otp: z.string().min(4).max(8),
  newPassword: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const enable2FaSchema = z.object({
  secret: z.string().min(10, 'Valid TOTP secret required'),
  code: z.string().min(6, '6-digit authenticator verification code required'),
});

const disable2FaSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required to disable 2FA'),
});

module.exports = {
  registerSchema,
  buyerRegisterSchema,
  sellerRegisterSchema,
  loginSchema,
  verify2FaLoginSchema,
  refreshSchema,
  forgotPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  enable2FaSchema,
  disable2FaSchema,
};
