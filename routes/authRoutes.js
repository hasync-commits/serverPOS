const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  refreshToken
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register',  register); // Admin only (checked in controller)
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.post('/refresh-token', refreshToken);

module.exports = router;
