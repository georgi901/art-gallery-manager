const express = require('express');

const { checkCascade } = require('../controllers/cascade.controller');

const router = express.Router();

router.get('/cascade/check/:table/:id', checkCascade);

module.exports = router;
