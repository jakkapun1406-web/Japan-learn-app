// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { getListeningQuestions } = require('../controllers/listening.controller');

// ============================================================
// ROUTER
// ============================================================
const router = express.Router();

// ============================================================
// ROUTES
// ============================================================
router.get('/questions/:level', requireAuth, getListeningQuestions);

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
