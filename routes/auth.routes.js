const express = require('express');
const rateLimit = require('express-rate-limit');

const { login, logout, me, register } = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);
module.exports = router;
