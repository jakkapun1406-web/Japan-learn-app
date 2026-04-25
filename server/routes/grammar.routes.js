// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getLessons, getLessonById } = require('../controllers/grammar.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// GRAMMAR ROUTES
// ============================================================
router.get('/lesson/:id', requireAuth, getLessonById); // GET /api/grammar/lesson/:id  — ต้องอยู่ก่อน /:level
router.get('/:level',     requireAuth, getLessons);    // GET /api/grammar/:level

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
