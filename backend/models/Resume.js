const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      trim: true,
    },
    storageProvider: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local',
    },
    filePublicId: {
      type: String,
      default: null,
    },
    extractedText: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model('Resume', resumeSchema);
