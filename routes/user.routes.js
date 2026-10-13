const express = require('express');

const { updateRole } = require('../controllers/auth.controller');
const asyncHandler = require('../middleware/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.put('/users/:id/role', authenticate, authorize('ADMIN'), asyncHandler(updateRole));

module.exports = router;
