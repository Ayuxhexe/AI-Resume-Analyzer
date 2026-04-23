const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    recommendations: {
      type: [String],
      default: [],
    },
    jobDescriptionSnippet: {
      type: String,
      default: '',
    },
  },
  { _id: false },
);

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    skills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    experienceSummary: {
      type: String,
      default: '',
      trim: true,
    },
    jobMatch: {
      type: jobMatchSchema,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model('Analysis', analysisSchema);
