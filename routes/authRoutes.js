const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  googleLogin,
  updateProfile,
  verifyEmailOTP,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/google', googleLogin);
router.post("/verify-otp", verifyEmailOTP);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;





