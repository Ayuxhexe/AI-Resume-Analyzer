const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendOtpEmail } = require('../services/emailService');
const generateOtpCode = require('../utils/generateOtpCode');
const generateToken = require('../utils/generateToken');
const generateVerificationToken = require('../utils/generateVerificationToken');

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 45 * 1000;

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  authProviders: user.authProviders,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is missing. Add it to backend/.env to enable Google sign-in.');
  }

  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

const mergeAuthProviders = (providers = [], nextProvider) =>
  [...new Set([...(providers || []), nextProvider])];

const buildOtpResponse = (user, message) => ({
  message,
  requiresOtp: true,
  email: user.email,
  verificationToken: generateVerificationToken(user._id),
});

const issueOtpChallenge = async (user, message) => {
  const otpCode = generateOtpCode();

  user.emailOtpHash = await bcrypt.hash(otpCode, 10);
  user.emailOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  user.lastOtpSentAt = new Date();
  await user.save();

  await sendOtpEmail({
    to: user.email,
    name: user.name,
    otpCode,
  });

  return buildOtpResponse(user, message);
};

const verifyOtpSessionToken = (verificationToken) => {
  if (!verificationToken) {
    throw new Error('Verification session is missing.');
  }

  const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);

  if (decoded.purpose !== 'auth_otp') {
    throw new Error('Invalid verification session.');
  }

  return decoded;
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required.');
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isEmailVerified) {
      res.status(409);
      throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.authProviders = mergeAuthProviders(user.authProviders, 'local');
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        authProviders: ['local'],
      });
    }

    const otpResponse = await issueOtpChallenge(
      user,
      'Account created. We sent a verification code to your email.',
    );

    res.status(201).json(otpResponse);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    if (!user.password) {
      res.status(400);
      throw new Error('This account uses Google sign-in. Please continue with Google.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const otpResponse = await issueOtpChallenge(
      user,
      'We sent a verification code to your email. Enter it to continue.',
    );

    res.status(200).json(otpResponse);
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error('Google credential is required.');
    }

    const ticket = await getGoogleClient().verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      res.status(400);
      throw new Error('Google account email could not be verified.');
    }

    if (!payload.email_verified) {
      res.status(400);
      throw new Error('Google account email is not verified.');
    }

    const normalizedEmail = payload.email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      user.googleId = user.googleId || payload.sub;
      user.name = user.name || payload.name || 'Google User';
      user.authProviders = mergeAuthProviders(user.authProviders, 'google');
      await user.save();
    } else {
      user = await User.create({
        name: payload.name || 'Google User',
        email: normalizedEmail,
        googleId: payload.sub,
        authProviders: ['google'],
      });
    }

    const otpResponse = await issueOtpChallenge(
      user,
      'Google sign-in accepted. We sent a verification code to your Gmail.',
    );

    res.status(200).json(otpResponse);
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { verificationToken, otp } = req.body;

    if (!verificationToken || !otp) {
      res.status(400);
      throw new Error('Verification token and OTP are required.');
    }

    const decoded = verifyOtpSessionToken(verificationToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.emailOtpHash || !user.emailOtpExpiresAt) {
      res.status(400);
      throw new Error('Verification session expired. Please request a new code.');
    }

    if (user.emailOtpExpiresAt.getTime() < Date.now()) {
      user.emailOtpHash = null;
      user.emailOtpExpiresAt = null;
      await user.save();
      res.status(400);
      throw new Error('The verification code has expired. Please request a new code.');
    }

    const isOtpValid = await bcrypt.compare(String(otp), user.emailOtpHash);

    if (!isOtpValid) {
      res.status(400);
      throw new Error('Invalid verification code.');
    }

    user.isEmailVerified = true;
    user.emailOtpHash = null;
    user.emailOtpExpiresAt = null;
    await user.save();

    res.status(200).json({
      message: 'Verification complete. You are now signed in.',
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { verificationToken } = req.body;
    const decoded = verifyOtpSessionToken(verificationToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found for this verification session.');
    }

    if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
      res.status(400);
      throw new Error('This verification session is no longer active. Please sign in again.');
    }

    if (
      user.lastOtpSentAt &&
      Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      res.status(429);
      throw new Error('Please wait a few seconds before requesting another code.');
    }

    const otpResponse = await issueOtpChallenge(
      user,
      'A new verification code has been sent to your email.',
    );

    res.status(200).json(otpResponse);
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    next(error);
  }
};

module.exports = {
  googleAuth,
  loginUser,
  registerUser,
  resendOtp,
  verifyOtp,
};
