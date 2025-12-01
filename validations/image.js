import Joi from 'joi';

export const createImageSchema = Joi.object({
  url: Joi.string()
    .uri()
    .required()
    .messages({
      'any.required': 'Image URL is required',
      'string.uri': 'Image URL must be a valid URI'
    }),

  publicId: Joi.string()
    .required()
    .messages({
      'any.required': 'Public ID is required',
      'string.base': 'Public ID must be a valid string'
    }),

  uploadedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'UploadedBy must be a valid MongoDB ObjectId'
    }),

  listingId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Listing ID must be a valid MongoDB ObjectId'
    }),

  roomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Room ID must be a valid MongoDB ObjectId'
    })
});
