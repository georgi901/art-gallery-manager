const AppError = require('../utils/AppError');
const { parsePagination } = require('../utils/pagination');
const { parseSort } = require('../utils/sort');
const { validateResourceBody } = require('../validators/resource.validator');
const service = require('../services/crud.service');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, 'VALIDATION_ERROR', 'ID must be a positive integer', {
      id: 'Must be a positive integer',
    });
  }
  return id;
}

function createController(resource, config) {
  return {
    list: async (req, res) => {
      const pageData = parsePagination(req.query);
      const sortData = parseSort(req.query, config);
      const result = await service.list(resource, config, req.query, pageData, sortData);
      res.json(result);
    },
    get: async (req, res) => {
      const row = await service.findById(config, parseId(req.params.id));
      if (!row) throw new AppError(404, 'NOT_FOUND', 'Record not found');
      res.json({ data: row, message: 'Record loaded successfully' });
    },
    create: async (req, res) => {
      const data = validateResourceBody(resource, req.body);
      const row = await service.create(config, data);
      res.status(201).json({ data: row, message: 'Record created successfully' });
    },
    update: async (req, res) => {
      const id = parseId(req.params.id);
      const current = await service.findById(config, id);
      if (!current) throw new AppError(404, 'NOT_FOUND', 'Record not found');
      const data = validateResourceBody(resource, req.body, { partial: true });
      const row = await service.update(config, id, data);
      res.json({ data: row, message: 'Record updated successfully' });
    },
    remove: async (req, res) => {
      const id = parseId(req.params.id);
      const removed = await service.remove(config, id);
      if (!removed) throw new AppError(404, 'NOT_FOUND', 'Record not found');
      res.json({ data: null, message: 'Record deleted successfully' });
    },
  };
}

module.exports = {
  createController,
};
