// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getWords, submitAnswer, getStatus } = require('../controllers/dailyQuiz.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// ============================================================
// ROUTES — /api/daily-quiz
// ============================================================
const router = express.Router();

router.get('/words',   requireAuth, getWords);
router.post('/answer', requireAuth, submitAnswer);
router.get('/status',  requireAuth, getStatus);

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
