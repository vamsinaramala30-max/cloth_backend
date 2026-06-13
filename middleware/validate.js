const { ZodError } = require('zod');

const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        success: false, 
        errors: error.errors.map(err => ({ field: err.path[0], message: err.message })) 
      });
    }
    return res.status(500).json({ success: false, message: 'Validation internal anomaly.' });
  }
};

module.exports = { validateBody };