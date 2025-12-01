import Joi from 'joi';

export const createAuditLogSchema = Joi.object({
  actorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Actor ID must be a valid MongoDB ObjectId'
    }),

  action: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'any.required': 'Action is required',
      'string.min': 'Action must be at least 3 characters long',
      'string.max': 'Action cannot exceed 100 characters'
    }),

  target: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Target cannot exceed 100 characters'
    }),

  metadata: Joi.object()
    .unknown(true)
    .optional()
    .messages({
      'object.base': 'Metadata must be a valid object'
    })
});
