// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getGrammarExplain } = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// ROUTES
// ============================================================
router.post('/grammar-explain', requireAuth, getGrammarExplain); // POST /api/ai/grammar-explain

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
