const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const { normalizeWhitespace } = require('../utils/formatters');
const {
  cleanupStoredResume,
  getFileBuffer,
  persistUploadedResume,
} = require('../services/storageService');

const uploadResume = async (req, res, next) => {
  let storedAsset = null;

  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a PDF resume.');
    }

    const fileBuffer = await getFileBuffer(req.file);
    const pdfResult = await pdfParse(fileBuffer);
    const extractedText = normalizeWhitespace(pdfResult.text || '');

    if (!extractedText) {
      res.status(400);
      throw new Error('Unable to extract text from the uploaded PDF.');
    }

    storedAsset = await persistUploadedResume(req.file);

    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: storedAsset.fileUrl,
      originalFileName: req.file.originalname,
      storageProvider: storedAsset.storageProvider,
      filePublicId: storedAsset.filePublicId,
      extractedText,
    });

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully.',
      resume,
    });
  } catch (error) {
    await cleanupStoredResume({ file: req.file, storedAsset });
    next(error);
  }
};

const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found.');
    }

    res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResumeById,
  uploadResume,
};
