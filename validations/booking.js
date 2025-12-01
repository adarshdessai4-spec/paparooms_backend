import Joi from 'joi';

export const createBookingSchema = Joi.object({
    roomId: Joi.string().required().messages({
        'any.required': 'Room ID is required.',
        'string.base': 'Room ID must be a string.'
    }),
    checkIn: Joi.date().required().messages({
        'any.required': 'Check-in date is required.',
        'date.base': 'Check-in must be a valid date.'
    }),
    checkOut: Joi.date().required().messages({
        'any.required': 'Check-out date is required.',
        'date.base': 'Check-out must be a valid date.'
    }),
    guests: Joi.number().min(1).default(1).messages({
        'number.base': 'Guests must be a number.',
        'number.min': 'There must be at least 1 guest.'
    }),
});
