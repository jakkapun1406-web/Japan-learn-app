// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET VOCAB — ดึงคำศัพท์ทั้งหมดใน deck
// ============================================================
export const getVocabByDeck = async (deckId) => {
  const { data } = await apiClient.get(`/api/decks/${deckId}/vocab`);
  return data.cards;
};

// ============================================================
// ADD VOCAB CARD — เพิ่มคำศัพท์ใหม่เข้า deck
// ============================================================
export const addVocabCard = async (deckId, card) => {
  const { data } = await apiClient.post(`/api/decks/${deckId}/vocab`, card);
  return data.card;
};

// ============================================================
// DELETE VOCAB CARD — ลบคำศัพท์ออกจาก deck
// ============================================================
export const deleteVocabCard = async (deckId, cardId) => {
  await apiClient.delete(`/api/decks/${deckId}/vocab/${cardId}`);
};
