// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET VOCAB HINT — ดึง AI hint สำหรับคำศัพท์
// ============================================================
export const getVocabHint = (word, reading, meaning) =>
  apiClient
    .post('/api/ai/vocab-hint', { word, reading, meaning })
    .then((r) => r.data.hint);

// ============================================================
// GET GRAMMAR EXPLAIN — ดึง AI อธิบายไวยากรณ์เพิ่มเติม
// ============================================================
export const getGrammarExplain = (grammarTitle, japanese, reading, thai) =>
  apiClient
    .post('/api/ai/grammar-explain', { grammarTitle, japanese, reading, thai })
    .then((r) => r.data.explanation);
