// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { initJlptDecks } = require('../controllers/jlptDeck.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// JLPT DECK ROUTES
// ============================================================
router.post('/init', requireAuth, initJlptDecks); // POST /api/jlpt-decks/init

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
