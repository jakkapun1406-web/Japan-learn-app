// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { authenticateUser } = require('../middleware/auth.middleware');
const { getListeningQuestions } = require('../controllers/listening.controller');

// ============================================================
// ROUTER
// ============================================================
const router = express.Router();

// ============================================================
// ROUTES
// ============================================================
router.get('/questions/:level', authenticateUser, getListeningQuestions);

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
