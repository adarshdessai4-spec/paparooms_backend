import Joi from 'joi';

export const createRoomSchema = Joi.object({
  title: Joi.string().required(),
  type: Joi.string().valid('single', 'double', 'suite').required(),
  pricePerNight: Joi.number().required(),
  maxGuests: Joi.number().min(1).default(2),
  bedInfo: Joi.string().allow(''),
  amenities: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .default([]),
  cancellationPolicy: Joi.string().allow(''),
});

export const updateRoomSchema = Joi.object({
  title: Joi.string(),
  type: Joi.string().valid('single', 'double', 'suite'),
  pricePerNight: Joi.number(),
  maxGuests: Joi.number().min(1),
  bedInfo: Joi.string().allow(''),
  amenities: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  cancellationPolicy: Joi.string().allow(''),
  removeImages: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
});
