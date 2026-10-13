const AppError = require('./AppError');

function parseSort(query, config) {
  const sort = query.sort || query.sortBy || config.primaryKey;
  const order = String(query.order || query.sortOrder || 'ASC').toUpperCase();

  if (![config.primaryKey, ...config.columns].includes(sort)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid sort column', {
      sort: 'This column cannot be used for sorting',
    });
  }

  if (!['ASC', 'DESC'].includes(order)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid sort order', {
      order: 'Use ASC or DESC',
    });
  }

  return { sort, order };
}

module.exports = {
  parseSort,
};
