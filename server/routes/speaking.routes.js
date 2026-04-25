// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getSpeakingWords } = require('../controllers/speaking.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// SPEAKING ROUTES
// ============================================================
router.get('/words/:level', requireAuth, getSpeakingWords); // GET /api/speaking/words/:level?limit=10

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
