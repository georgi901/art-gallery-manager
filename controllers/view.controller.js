const asyncHandler = require('../middleware/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const service = require('../services/view.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.listViews();
  res.json({ data, message: 'Views loaded successfully' });
});

const read = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const data = await service.readView(req.params.viewName.toUpperCase(), page, limit);
  res.json(data);
});

const create = asyncHandler(async (req, res) => {
  const data = await service.recreateViews();
  res.json({ data, message: 'Views created successfully' });
});

module.exports = {
  create,
  list,
  read,
};
