const AppError = require('./AppError');

function mapOracleError(error) {
  const message = error?.message || '';

  if (message.includes('ORA-00001')) {
    return new AppError(409, 'CONFLICT', 'A record with these unique values already exists');
  }
  if (message.includes('ORA-02291')) {
    return new AppError(400, 'FOREIGN_KEY_ERROR', 'A referenced record does not exist');
  }
  if (message.includes('ORA-02292')) {
    return new AppError(409, 'DEPENDENCY_CONFLICT', 'The record has dependent records');
  }
  if (message.includes('ORA-02290')) {
    return new AppError(400, 'VALIDATION_ERROR', 'The data violates a database constraint');
  }

  return error;
}

module.exports = {
  mapOracleError,
};
