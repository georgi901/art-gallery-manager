const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { check } = require('../services/cascade.service');

const checkCascade = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, 'VALIDATION_ERROR', 'ID must be a positive integer', {
      id: 'Must be a positive integer',
    });
  }
  const data = await check(req.params.table.toUpperCase(), id);
  res.json({ data, message: 'Cascade impact checked successfully' });
});

module.exports = {
  checkCascade,
};
