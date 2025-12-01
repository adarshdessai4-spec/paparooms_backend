import Joi from 'joi';

// 🔹 Create KYC Validation
export const createKycValidation = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),

  profilePhoto: Joi.string().uri().required().messages({
    'string.empty': 'Profile photo URL is required',
    'string.uri': 'Profile photo must be a valid URL',
  }),

  aadharCard: Joi.string().uri().required().messages({
    'string.empty': 'Aadhar card document is required',
    'string.uri': 'Aadhar card must be a valid URL',
  }),

  panCard: Joi.string().uri().required().messages({
    'string.empty': 'PAN card document is required',
    'string.uri': 'PAN card must be a valid URL',
  }),

  bankName: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Bank name is required',
    'string.min': 'Bank name must have at least 2 characters',
  }),

  accountName: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Account holder name is required',
    'string.min': 'Account holder name must have at least 2 characters',
  }),

  accountNumber: Joi.string()
    .pattern(/^\d{9,18}$/)
    .required()
    .messages({
      'string.pattern.base': 'Account number must be between 9 and 18 digits',
      'string.empty': 'Account number is required',
    }),

  ifscCode: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid IFSC code format (e.g., HDFC0001234)',
      'string.empty': 'IFSC code is required',
    }),

  accountType: Joi.string()
    .valid('savings', 'current')
    .required()
    .messages({
      'any.only': 'Account type must be either "savings" or "current"',
      'string.empty': 'Account type is required',
    }),

  branch: Joi.string().trim().required().messages({
    'string.empty': 'Branch name is required',
  }),
});

// 🔹 Update (Resubmit) KYC Validation
export const updateKycValidation = Joi.object({
  profilePhoto: Joi.string().uri().optional().messages({
    'string.uri': 'Profile photo must be a valid URL',
  }),

  aadharCard: Joi.string().uri().optional().messages({
    'string.uri': 'Aadhar card must be a valid URL',
  }),

  panCard: Joi.string().uri().optional().messages({
    'string.uri': 'PAN card must be a valid URL',
  }),

  bankName: Joi.string().trim().min(2).optional().messages({
    'string.min': 'Bank name must have at least 2 characters',
  }),

  accountName: Joi.string().trim().min(2).optional().messages({
    'string.min': 'Account holder name must have at least 2 characters',
  }),

  accountNumber: Joi.string()
    .pattern(/^\d{9,18}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Account number must be between 9 and 18 digits',
    }),

  ifscCode: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid IFSC code format (e.g., HDFC0001234)',
    }),

  accountType: Joi.string()
    .valid('savings', 'current')
    .optional()
    .messages({
      'any.only': 'Account type must be either "savings" or "current"',
    }),

  branch: Joi.string().trim().optional(),

  status: Joi.string()
    .valid('pending', 'approved', 'rejected')
    .optional(),

  rejectionReason: Joi.string().allow('', null).optional(),
});
