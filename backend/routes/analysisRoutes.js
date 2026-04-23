const express = require('express');
const {
  analyzeResume,
  getAnalysesByUser,
  jobMatchAnalysis,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, analyzeResume);
router.post('/job-match', protect, jobMatchAnalysis);
router.get('/:userId', protect, getAnalysesByUser);

module.exports = router;
