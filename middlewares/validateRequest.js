// middleware/validateRequest.js
const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // Format each Joi validation error
    const errors = error.details.map((err) => ({
      field: err.path.join('.'), // handles nested paths too
      message: err.message.replace(/"/g, ''), // removes quotes
    }));

    // Combine messages into one readable string (for logging or debug)
    const combinedMessage = errors.map(e => `${e.field}: ${e.message}`).join(', ');

    return res.status(400).json({
      success: false,
      message: `Validation failed: ${combinedMessage}`,
      errors, // detailed field-wise errors for frontend
    });
  }

  next();
};

export default validateRequest;
