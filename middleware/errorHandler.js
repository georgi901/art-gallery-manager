function errorHandler(error, req, res, _next) {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = status >= 500 ? 'Internal server error' : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      code,
      message,
      fields: error.fields || {},
    },
  });
}

module.exports = errorHandler;
