// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET DUE CARDS — ดึงการ์ดสำหรับ review
// mode: 'due' (default) | 'all'
// ============================================================
export const getDueCards = async (deckId, mode = 'due') => {
  const { data } = await apiClient.get(`/api/decks/${deckId}/review`, {
    params: { mode },
  });
  return data; // { cards, total, mode }
};

// ============================================================
// SUBMIT REVIEW — ส่ง grade (0–3) หลังพลิกการ์ด
// ============================================================
export const submitReview = async (deckId, cardId, grade) => {
  const { data } = await apiClient.post(`/api/decks/${deckId}/review`, { card_id: cardId, grade });
  return data.review_log;
};
