// ============================================================
// IMPORTS
// ============================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth.routes');
const deckRoutes      = require('./routes/deck.routes');
const vocabRoutes     = require('./routes/vocab.routes');
const reviewRoutes    = require('./routes/review.routes');
const jlptVocabRoutes = require('./routes/jlptVocab.routes');
const jlptDeckRoutes  = require('./routes/jlptDeck.routes');
const grammarRoutes   = require('./routes/grammar.routes');
const readingRoutes   = require('./routes/reading.routes');
const speakingRoutes  = require('./routes/speaking.routes');

// ============================================================
// APP SETUP
// ============================================================
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARE
// ============================================================
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server requests (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth',              authRoutes);
app.use('/api/decks',             deckRoutes);
app.use('/api/decks/:deckId/vocab',  vocabRoutes);
app.use('/api/decks/:deckId/review', reviewRoutes);
app.use('/api/jlpt-vocab',           jlptVocabRoutes);
app.use('/api/jlpt-decks',           jlptDeckRoutes);
app.use('/api/grammar',              grammarRoutes);
app.use('/api/reading',              readingRoutes);
app.use('/api/speaking',             speakingRoutes);

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
