import Joi from 'joi';

// Regular signup validation (local auth with email/password)
export const registerUserSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.base': 'Name must be a string.',
            'string.empty': 'Name is required.',
            'string.min': 'Name must be at least 2 characters.',
            'string.max': 'Name must be at most 50 characters.',
            'any.required': 'Name is required.'
        }),
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.base': 'Email must be a string.',
            'string.email': 'Email must be a valid email address.',
            'string.empty': 'Email is required.',
            'any.required': 'Email is required.'
        }),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .trim()
        .optional()
        .allow('', null) // Allow empty string or null
        .messages({
            'string.pattern.base': 'Phone must be a valid 10 digit number.',
            'string.base': 'Phone must be a string.'
        }),
    password: Joi.string()
        .min(8)
        .max(128) // Add max length for security
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // At least one lowercase, uppercase, and digit
        .required()
        .messages({
            'string.base': 'Password must be a string.',
            'string.empty': 'Password is required.',
            'string.min': 'Password must be at least 8 characters.',
            'string.max': 'Password must be at most 128 characters.',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'any.required': 'Password is required.'
        }),
    role: Joi.string()
        .valid('guest', 'owner', 'admin')
        .optional()
        .default('guest')
        .messages({
            'any.only': 'Role must be one of guest, owner, or admin.',
            'string.base': 'Role must be a string.'
        }),
});

// Login validation (local auth)
export const loginUserSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.base': 'Email must be a string.',
            'string.email': 'Email must be a valid email address.',
            'string.empty': 'Email is required.',
            'any.required': 'Email is required.'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.base': 'Password must be a string.',
            'string.empty': 'Password is required.',
            'any.required': 'Password is required.'
        }),
});

// Google OAuth validation
export const googleAuthSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'string.base': 'Token must be a string.',
            'string.empty': 'Google token is required.',
            'any.required': 'Google token is required.'
        }),
});

// Update user profile validation
export const updateUserSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .optional()
        .messages({
            'string.base': 'Name must be a string.',
            'string.min': 'Name must be at least 2 characters.',
            'string.max': 'Name must be at most 50 characters.',
        }),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .trim()
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'Phone must be a valid 10 digit number.',
            'string.base': 'Phone must be a string.'
        }),
    profilePicture: Joi.string()
        .uri()
        .trim()
        .optional()
        .allow('', null)
        .messages({
            'string.uri': 'Profile picture must be a valid URL.',
            'string.base': 'Profile picture must be a string.'
        }),
})
.min(1)
.messages({
    'object.min': 'At least one field must be provided to update.'
});

// Forgot password validation
export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.base': 'Email must be a string.',
            'string.email': 'Valid email is required.',
            'string.empty': 'Email is required.',
            'any.required': 'Email is required.',
        }),
});

// Reset password validation
export const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.base': 'Email must be a string.',
            'string.email': 'Valid email is required.',
            'string.empty': 'Email is required.',
            'any.required': 'Email is required.',
        }),
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits.',
            'string.pattern.base': 'OTP must contain only numbers.',
            'string.empty': 'OTP is required.',
            'any.required': 'OTP is required.',
        }),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.base': 'Password must be a string.',
            'string.empty': 'New password is required.',
            'string.min': 'New password must be at least 8 characters.',
            'string.max': 'New password must be at most 128 characters.',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'any.required': 'New password is required.'
        }),
});

// Change password validation (for authenticated users)
export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Current password is required.',
            'any.required': 'Current password is required.'
        }),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .invalid(Joi.ref('currentPassword'))
        .messages({
            'string.base': 'New password must be a string.',
            'string.empty': 'New password is required.',
            'string.min': 'New password must be at least 8 characters.',
            'string.max': 'New password must be at most 128 characters.',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'any.required': 'New password is required.',
            'any.invalid': 'New password must be different from current password.'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match.',
            'string.empty': 'Please confirm your new password.',
            'any.required': 'Password confirmation is required.'
        })
});

// Optional: Verify email OTP schema (if you implement email verification)
export const verifyEmailSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Valid email is required.',
            'any.required': 'Email is required.',
        }),
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits.',
            'string.pattern.base': 'OTP must contain only numbers.',
            'any.required': 'OTP is required.',
        }),
});

// Optional: Resend OTP schema
export const resendOtpSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Valid email is required.',
            'any.required': 'Email is required.',
        }),
});
