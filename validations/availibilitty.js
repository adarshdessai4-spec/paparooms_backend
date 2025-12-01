import Joi from 'joi';

export const createAvailabilitySchema = Joi.object({
  roomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Room ID is required',
      'string.pattern.base': 'Room ID must be a valid MongoDB ObjectId'
    }),

  date: Joi.date()
    .required()
    .messages({
      'any.required': 'Date is required',
      'date.base': 'Date must be a valid date format'
    }),

  isBooked: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'isBooked must be true or false'
    }),

  priceOverride: Joi.number()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Price override must be a valid number',
      'number.positive': 'Price override must be greater than 0'
    }),

  blockedReason: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Blocked reason cannot exceed 100 characters'
    })
});
