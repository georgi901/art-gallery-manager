const express = require('express');

const asyncHandler = require('../middleware/asyncHandler');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { createJunctionController } = require('../controllers/junction.controller');
const { getJunction } = require('../utils/resourceConfig');

function createJunctionRouter(resource) {
  const config = getJunction(resource);
  const controller = createJunctionController(config);
  const router = express.Router();

  router.get('/', asyncHandler(controller.list));
  router.post(
    '/',
    authorize('ADMIN', 'CURATOR'),
    validateBody(config.columns),
    asyncHandler(controller.create)
  );
  router.delete('/:id1/:id2', authorize('ADMIN'), asyncHandler(controller.remove));

  return router;
}

module.exports = {
  createJunctionRouter,
};
