const jwt = require('jsonwebtoken');

const generateVerificationToken = (userId) =>
  jwt.sign(
    {
      id: userId,
      purpose: 'auth_otp',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.OTP_TOKEN_EXPIRES_IN || '15m',
    },
  );

module.exports = generateVerificationToken;
