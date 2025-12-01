import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  bookingId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Booking ID is required',
      'string.pattern.base': 'Booking ID must be a valid MongoDB ObjectId'
    }),

  guestId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Guest ID is required',
      'string.pattern.base': 'Guest ID must be a valid MongoDB ObjectId'
    }),

  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Amount must be a valid number',
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),

  provider: Joi.string()
    .valid('stripe')
    .default('stripe')
    .messages({
      'any.only': 'Provider must be stripe'
    }),

  paymentIntentId: Joi.string()
    .trim()
    .allow('')
    .messages({
      'string.base': 'Payment intent ID must be a string'
    }),

  status: Joi.string()
    .valid('pending', 'succeeded', 'failed', 'refunded')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, succeeded, failed, refunded'
    })
});
