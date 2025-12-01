import Joi from 'joi';

export const createReviewSchema = Joi.object({
  listingId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Listing ID is required',
      'string.pattern.base': 'Listing ID must be a valid MongoDB ObjectId'
    }),

  guestId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Guest ID is required',
      'string.pattern.base': 'Guest ID must be a valid MongoDB ObjectId'
    }),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'any.required': 'Rating is required',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'number.base': 'Rating must be a number'
    }),

  comment: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Comment cannot exceed 500 characters'
    })
});
