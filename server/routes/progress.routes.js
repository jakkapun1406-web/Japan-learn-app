// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const { getProgressStats } = require('../controllers/progress.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// ROUTES
// ============================================================
router.get('/stats', requireAuth, getProgressStats); // GET /api/progress/stats

// ============================================================
// EXPORTS
// ============================================================
module.exports = router;
