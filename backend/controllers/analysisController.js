const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const {
  analyzeResumeWithAI,
  matchResumeToJobWithAI,
} = require('../services/openaiService');
const { normalizeWhitespace } = require('../utils/formatters');

const resolveResumeContext = async ({ resumeId, resumeText, userId }) => {
  if (resumeText?.trim()) {
    return {
      resumeId: resumeId || null,
      text: normalizeWhitespace(resumeText),
    };
  }

  if (!resumeId) {
    throw new Error('Provide either resumeText or resumeId.');
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw new Error('Resume not found for this user.');
  }

  return {
    resumeId: resume._id,
    text: resume.extractedText,
  };
};

const analyzeResume = async (req, res, next) => {
  try {
    const { resumeId, resumeText } = req.body;
    const resolvedResume = await resolveResumeContext({
      resumeId,
      resumeText,
      userId: req.user._id,
    });

    const aiResult = await analyzeResumeWithAI(resolvedResume.text);

    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resolvedResume.resumeId,
      score: aiResult.score,
      skills: aiResult.skills,
      missingSkills: [],
      suggestions: aiResult.suggestions,
      experienceSummary: aiResult.experienceSummary,
      jobMatch: null,
    });

    res.status(201).json({
      message: 'Resume analysis completed successfully.',
      result: aiResult,
      analysis,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    next(error);
  }
};

const jobMatchAnalysis = async (req, res, next) => {
  try {
    const { resumeId, resumeText, jobDescription } = req.body;

    if (!jobDescription?.trim()) {
      res.status(400);
      throw new Error('A job description is required for matching.');
    }

    const resolvedResume = await resolveResumeContext({
      resumeId,
      resumeText,
      userId: req.user._id,
    });

    let baselineAnalysis = null;

    if (resolvedResume.resumeId) {
      baselineAnalysis = await Analysis.findOne({
        userId: req.user._id,
        resumeId: resolvedResume.resumeId,
      }).sort({ createdAt: -1 });
    }

    if (!baselineAnalysis) {
      const aiResumeAnalysis = await analyzeResumeWithAI(resolvedResume.text);

      baselineAnalysis = {
        score: aiResumeAnalysis.score,
        skills: aiResumeAnalysis.skills,
        suggestions: aiResumeAnalysis.suggestions,
        experienceSummary: aiResumeAnalysis.experienceSummary,
      };
    }

    const jobMatch = await matchResumeToJobWithAI(resolvedResume.text, jobDescription);

    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resolvedResume.resumeId,
      score: baselineAnalysis.score,
      skills: baselineAnalysis.skills,
      missingSkills: jobMatch.missingSkills,
      suggestions: baselineAnalysis.suggestions,
      experienceSummary: baselineAnalysis.experienceSummary,
      jobMatch: {
        percentage: jobMatch.matchPercentage,
        recommendations: jobMatch.recommendations,
        jobDescriptionSnippet: normalizeWhitespace(jobDescription).slice(0, 240),
      },
    });

    res.status(201).json({
      message: 'Job match analysis completed successfully.',
      result: jobMatch,
      analysis,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    next(error);
  }
};

const getAnalysesByUser = async (req, res, next) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      res.status(403);
      throw new Error('You are not allowed to view analyses for another user.');
    }

    const analyses = await Analysis.find({
      userId: req.params.userId,
    })
      .populate('resumeId', 'fileUrl originalFileName createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(analyses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getAnalysesByUser,
  jobMatchAnalysis,
};
