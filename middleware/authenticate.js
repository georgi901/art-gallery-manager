const jwt = require('jsonwebtoken');

const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Authentication token is invalid or expired'));
  }
}

module.exports = authenticate;
