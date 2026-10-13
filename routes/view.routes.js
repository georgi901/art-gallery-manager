const express = require('express');

const controller = require('../controllers/view.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:viewName', controller.read);
router.post('/create', controller.create);

module.exports = router;
