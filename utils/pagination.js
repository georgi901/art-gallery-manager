const AppError = require('./AppError');

function parsePagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Page must be a positive integer', {
      page: 'Must be a positive integer',
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Limit must be between 1 and 100', {
      limit: 'Must be an integer between 1 and 100',
    });
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function paginationResult(rows, page, limit, total) {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  paginationResult,
  parsePagination,
};
