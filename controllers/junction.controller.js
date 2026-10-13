const AppError = require('../utils/AppError');
const service = require('../services/junction.service');

function parseKey(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'VALIDATION_ERROR', `${name} must be a positive integer`, {
      [name]: 'Must be a positive integer',
    });
  }
  return parsed;
}

function createJunctionController(config) {
  return {
    list: async (req, res) => {
      const rows = await service.list(config);
      res.json({
        data: rows,
        pagination: {
          page: 1,
          limit: rows.length,
          total: rows.length,
          totalPages: rows.length ? 1 : 0,
        },
      });
    },
    create: async (req, res) => {
      const data = {};
      config.columns.forEach((column) => {
        if (req.body[column] !== undefined) data[column] = req.body[column];
      });
      const missing = config.primaryKeys.filter((key) => data[key] === undefined);
      if (missing.length) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Composite key is required', {
          [missing[0]]: 'This field is required',
        });
      }
      const row = await service.create(config, data);
      res.status(201).json({ data: row, message: 'Relationship created successfully' });
    },
    remove: async (req, res) => {
      const values = {};
      config.primaryKeys.forEach((key, index) => {
        values[key] = parseKey(req.params[`id${index + 1}`], key);
      });
      const removed = await service.remove(config, values);
      if (!removed) throw new AppError(404, 'NOT_FOUND', 'Relationship not found');
      res.json({ data: null, message: 'Relationship deleted successfully' });
    },
  };
}

module.exports = {
  createJunctionController,
};
