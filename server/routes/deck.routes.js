// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getDecks, createDeck, deleteDeck } = require('../controllers/deck.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// DECK ROUTES — ทุก route ต้องผ่าน requireAuth
// ============================================================
router.get('/',     requireAuth, getDecks);     // GET  /api/decks
router.post('/',    requireAuth, createDeck);   // POST /api/decks
router.delete('/:id', requireAuth, deleteDeck); // DELETE /api/decks/:id

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
