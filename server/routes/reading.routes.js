// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { getKanaLessons, getKanjiLessons, getLessonById } = require('../controllers/reading.controller');

// ============================================================
// ROUTER
// ============================================================
const router = express.Router();

// ============================================================
// ROUTES — /lesson/:id MUST be first to avoid :type conflict
// ============================================================
router.get('/lesson/:id',   requireAuth, getLessonById);
router.get('/kana/:type',   requireAuth, getKanaLessons);
router.get('/kanji/:level', requireAuth, getKanjiLessons);

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
