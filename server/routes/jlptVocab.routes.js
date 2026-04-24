// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getJlptVocab } = require('../controllers/jlptVocab.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// JLPT VOCAB ROUTES
// ============================================================
router.get('/:level', requireAuth, getJlptVocab); // GET /api/jlpt-vocab/:level

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
