const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/resend-otp', authController.resendOTP);

// Protected profile route
router.get('/profile', protect, authController.getProfile);

module.exports = router;
