// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getDecks, createDeck, deleteDeck, renameDeck } = require('../controllers/deck.controller');
const { importVocab } = require('../controllers/jlptVocab.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// DECK ROUTES — ทุก route ต้องผ่าน requireAuth
// ============================================================
router.get('/',                    requireAuth, getDecks);     // GET    /api/decks
router.post('/',                   requireAuth, createDeck);   // POST   /api/decks
router.delete('/:id',              requireAuth, deleteDeck);   // DELETE /api/decks/:id
router.patch('/:id',               requireAuth, renameDeck);  // PATCH  /api/decks/:id
router.post('/:deckId/import',     requireAuth, importVocab);  // POST   /api/decks/:deckId/import

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
