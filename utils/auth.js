const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AppError = require('./AppError');

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{10,}$/;
const ROLES = ['ADMIN', 'CURATOR', 'VIEWER'];

function validatePassword(password) {
  if (typeof password !== 'string' || !PASSWORD_PATTERN.test(password)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Password must contain at least 10 characters, including letters and numbers',
      { password: 'At least 10 characters, including letters and numbers' }
    );
  }
}

function validateRole(role) {
  if (!ROLES.includes(role)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid role', {
      role: `Allowed roles: ${ROLES.join(', ')}`,
    });
  }
}

async function hashPassword(password) {
  validatePassword(password);
  return bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new AppError(500, 'AUTH_NOT_CONFIGURED', 'Authentication is not configured');
  }
  return jwt.sign(
    { sub: user.ID_USER, username: user.USERNAME, role: user.ROLE },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

function publicUser(user) {
  return {
    id: user.ID_USER,
    username: user.USERNAME,
    email: user.EMAIL,
    role: user.ROLE,
  };
}

module.exports = {
  ROLES,
  comparePassword,
  hashPassword,
  publicUser,
  signToken,
  validatePassword,
  validateRole,
};
