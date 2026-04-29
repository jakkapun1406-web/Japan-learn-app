// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// DAILY QUIZ SERVICE — wrapper สำหรับ /api/daily-quiz endpoints
// level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null (= ทั้งหมด)
// ============================================================

export const getDailyQuizWords = async (level = null) => {
  const params = level ? { level } : {};
  const { data } = await apiClient.get('/api/daily-quiz/words', { params });
  return data; // { words, remaining }
};

export const submitDailyQuizAnswer = async (word_id, is_correct) => {
  const { data } = await apiClient.post('/api/daily-quiz/answer', { word_id, is_correct });
  return data; // { ok: true }
};

export const getDailyQuizStatus = async (level = null) => {
  const params = level ? { level } : {};
  const { data } = await apiClient.get('/api/daily-quiz/status', { params });
  return data; // { answered, correct, total }
};
