// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET DECKS — ดึง deck ทั้งหมด (กรองตาม jlpt_level ได้)
// ============================================================
export const getDecks = async (jlptLevel = null) => {
  const params = jlptLevel ? { jlpt_level: jlptLevel } : {};
  const { data } = await apiClient.get('/api/decks', { params });
  return data.decks;
};

// ============================================================
// CREATE DECK — สร้าง deck ใหม่
// ============================================================
export const createDeck = async (name, jlptLevel) => {
  const { data } = await apiClient.post('/api/decks', { name, jlpt_level: jlptLevel });
  return data.deck;
};

// ============================================================
// DELETE DECK — ลบ deck
// ============================================================
export const deleteDeck = async (deckId) => {
  await apiClient.delete(`/api/decks/${deckId}`);
};
