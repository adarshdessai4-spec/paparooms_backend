import Joi from 'joi';

export const createNotificationSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'User ID is required',
      'string.pattern.base': 'User ID must be a valid MongoDB ObjectId'
    }),

  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'any.required': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),

  message: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'any.required': 'Message is required',
      'string.min': 'Message must be at least 5 characters long',
      'string.max': 'Message cannot exceed 500 characters'
    }),

  type: Joi.string()
    .valid('booking', 'payment', 'system')
    .default('system')
    .messages({
      'any.only': 'Type must be one of booking, payment, or system'
    }),

  isRead: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'isRead must be a boolean value'
    })
});
