// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getDueCards, submitReview } = require('../controllers/review.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true }); // mergeParams เพื่อรับ :deckId จาก parent route

// ============================================================
// REVIEW ROUTES — ทุก route ต้องผ่าน requireAuth
// ============================================================
router.get('/',  requireAuth, getDueCards);   // GET  /api/decks/:deckId/review
router.post('/', requireAuth, submitReview);  // POST /api/decks/:deckId/review

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
