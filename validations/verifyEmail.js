import Joi from 'joi';

// Validation for sending OTP (no body required, but kept for consistency)
export const sendOtp = Joi.object({
  // No fields required - user ID comes from auth middleware
});

// Validation for verifying OTP
export const verifyOtp = Joi.object({
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits.',
      'string.pattern.base': 'OTP must contain only numbers.',
      'string.empty': 'OTP is required.',
      'any.required': 'OTP is required.'
    }),
});
