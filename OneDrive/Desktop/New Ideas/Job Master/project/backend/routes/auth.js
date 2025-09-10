const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerAdmin,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  verifyResetToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/student/register', registerStudent);
router.post('/admin/register', registerAdmin);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
