const express = require('express');
const {
  googleAuth,
  loginUser,
  registerUser,
  resendOtp,
  verifyOtp,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

module.exports = router;
