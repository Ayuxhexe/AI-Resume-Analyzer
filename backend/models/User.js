const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    authProviders: {
      type: [String],
      enum: ['local', 'google'],
      default: [],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtpHash: {
      type: String,
      default: null,
    },
    emailOtpExpiresAt: {
      type: Date,
      default: null,
    },
    lastOtpSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model('User', userSchema);
