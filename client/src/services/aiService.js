// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET GRAMMAR EXPLAIN — ดึง AI อธิบายไวยากรณ์เพิ่มเติม
// ============================================================
export const getGrammarExplain = (grammarTitle, japanese, reading, thai) =>
  apiClient
    .post('/api/ai/grammar-explain', { grammarTitle, japanese, reading, thai })
    .then((r) => r.data.explanation);
