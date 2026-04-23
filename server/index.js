// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes   = require('./routes/auth.routes');
const deckRoutes   = require('./routes/deck.routes');
const vocabRoutes  = require('./routes/vocab.routes');
const reviewRoutes = require('./routes/review.routes');

// ============================================================
// APP SETUP
// ============================================================
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth',              authRoutes);
app.use('/api/decks',             deckRoutes);
app.use('/api/decks/:deckId/vocab',  vocabRoutes);
app.use('/api/decks/:deckId/review', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
