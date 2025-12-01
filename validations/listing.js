import Joi from 'joi';

export const createListingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Title must be a string.',
      'string.empty': 'Title is required.',
      'string.min': 'Title must be at least 3 characters long.',
      'string.max': 'Title must be at most 100 characters long.',
      'any.required': 'Title is required.',
    }),

  description: Joi.string()
    .allow('')
    .optional()
    .messages({
      'string.base': 'Description must be a string.',
    }),

  address: Joi.object({
    line1: Joi.string().required().messages({
      'string.base': 'Address line1 must be a string.',
      'string.empty': 'Address line1 is required.',
      'any.required': 'Address line1 is required.',
    }),
    city: Joi.string().required().messages({
      'string.base': 'City must be a string.',
      'string.empty': 'City is required.',
      'any.required': 'City is required.',
    }),
    state: Joi.string().required().messages({
      'string.base': 'State must be a string.',
      'string.empty': 'State is required.',
      'any.required': 'State is required.',
    }),
    country: Joi.string().required().messages({
      'string.base': 'Country must be a string.',
      'string.empty': 'Country is required.',
      'any.required': 'Country is required.',
    }),
    pincode: Joi.string().required().messages({
      'string.base': 'Pincode must be a string.',
      'string.empty': 'Pincode is required.',
      'any.required': 'Pincode is required.',
    }),
  }).messages({
    'object.base': 'Address must be an object.',
  }),

  amenities: Joi.array()
    .items(Joi.string().messages({
      'string.base': 'Each amenity must be a string.',
    }))
    .optional()
    .messages({
      'array.base': 'Amenities must be an array.',
    }),

  policies: Joi.array()
    .items(Joi.string().messages({
      'string.base': 'Each policy must be a string.',
    }))
    .optional()
    .messages({
      'array.base': 'Policies must be an array.',
    }),

  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array()
      .items(Joi.number().messages({
        'number.base': 'Each coordinate must be a number.'
      }))
      .length(2)
      .required()
      .messages({
        'array.base': 'Coordinates must be an array.',
        'array.length': 'Coordinates must contain exactly 2 numbers: [lng, lat].',
        'any.required': 'Coordinates are required.'
      })
  }).required().messages({
    'object.base': 'Location must be an object.'
  }),

  // Added: coverImage is sent by your controller
  coverImage: Joi.string().allow('', null).optional(),

  images: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Each image ID must be a valid MongoDB ObjectId.',
    }))
    .optional()
    .messages({
      'array.base': 'Images must be an array.',
    }),

  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('draft')
    .messages({
      'any.only': 'Status must be one of draft, published, or archived.',
    }),

  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

export const updateListingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .messages({
      'string.base': 'Title must be a string.',
      'string.min': 'Title must be at least 3 characters long.',
      'string.max': 'Title must be at most 100 characters long.',
    }),

  description: Joi.string()
    .allow('')
    .messages({
      'string.base': 'Description must be a string.',
    }),

  address: Joi.object({
    line1: Joi.string().messages({
      'string.base': 'Address line1 must be a string.',
    }),
    city: Joi.string().messages({
      'string.base': 'City must be a string.',
    }),
    state: Joi.string().messages({
      'string.base': 'State must be a string.',
    }),
    country: Joi.string().messages({
      'string.base': 'Country must be a string.',
    }),
    pincode: Joi.string().messages({
      'string.base': 'Pincode must be a string.',
    }),
  }).messages({
    'object.base': 'Address must be an object.',
  }),

  amenities: Joi.array()
    .items(Joi.string().messages({
      'string.base': 'Each amenity must be a string.',
    }))
    .messages({
      'array.base': 'Amenities must be an array.',
    }),

  policies: Joi.array()
    .items(Joi.string().messages({
      'string.base': 'Each policy must be a string.',
    }))
    .messages({
      'array.base': 'Policies must be an array.',
    }),

  // CHANGED: make location optional for updates (still validated if present)
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array()
      .items(Joi.number().messages({
        'number.base': 'Each coordinate must be a number.'
      }))
      .length(2)
      .required()
      .messages({
        'array.base': 'Coordinates must be an array.',
        'array.length': 'Coordinates must contain exactly 2 numbers: [lng, lat].',
        'any.required': 'Coordinates are required.'
      })
  }).optional().messages({
    'object.base': 'Location must be an object.'
  }),

  // Added: coverImage to match controller
  coverImage: Joi.string().allow('', null).optional(),

  images: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Each image ID must be a valid MongoDB ObjectId.',
    }))
    .messages({
      'array.base': 'Images must be an array.',
    }),

  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .messages({
      'any.only': 'Status must be one of draft, published, or archived.',
    }),

  updatedAt: Joi.date().optional(),
})
.min(1) // ensure at least one field is being updated
.messages({
  'object.min': 'At least one field must be provided for update.',
});
