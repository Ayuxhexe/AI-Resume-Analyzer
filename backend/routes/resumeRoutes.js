const express = require('express');
const { getResumeById, uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/:id', protect, getResumeById);

module.exports = router;
