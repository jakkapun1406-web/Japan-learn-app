// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getVocabByDeck, addVocabCard, deleteVocabCard, updateVocabCard } = require('../controllers/vocab.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true }); // mergeParams เพื่อรับ :deckId จาก parent route

// ============================================================
// VOCAB ROUTES — ทุก route ต้องผ่าน requireAuth
// ============================================================
router.get('/',          requireAuth, getVocabByDeck); // GET  /api/decks/:deckId/vocab
router.post('/',         requireAuth, addVocabCard);   // POST /api/decks/:deckId/vocab
router.put('/:cardId',    requireAuth, updateVocabCard);  // PUT    /api/decks/:deckId/vocab/:cardId
router.delete('/:cardId', requireAuth, deleteVocabCard); // DELETE /api/decks/:deckId/vocab/:cardId

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
