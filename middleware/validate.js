const AppError = require('../utils/AppError');

function validateBody(allowedFields) {
  return (req, res, next) => {
    const fields = {};
    const body = req.body || {};

    Object.keys(body).forEach((field) => {
      if (!allowedFields.includes(field)) {
        fields[field] = 'Unknown field';
      }
    });

    if (Object.keys(fields).length > 0) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Request contains unknown fields', fields));
      return;
    }

    next();
  };
}

module.exports = {
  validateBody,
};
