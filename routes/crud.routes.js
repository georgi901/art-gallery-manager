const express = require('express');

const asyncHandler = require('../middleware/asyncHandler');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { createController } = require('../controllers/crud.controller');
const { getResource } = require('../utils/resourceConfig');

function createCrudRouter(resource) {
  const config = getResource(resource);
  const controller = createController(resource, config);
  const router = express.Router();

  router.get('/', asyncHandler(controller.list));
  router.get('/:id', asyncHandler(controller.get));
  router.post(
    '/',
    authorize('ADMIN', 'CURATOR'),
    validateBody(config.columns),
    asyncHandler(controller.create)
  );
  router.put(
    '/:id',
    authorize('ADMIN', 'CURATOR'),
    validateBody(config.columns),
    asyncHandler(controller.update)
  );
  router.delete('/:id', authorize('ADMIN'), asyncHandler(controller.remove));

  return router;
}

module.exports = {
  createCrudRouter,
};
