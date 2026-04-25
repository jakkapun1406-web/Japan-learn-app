// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET KANA LESSONS — ดึง lesson list สำหรับ hiragana หรือ katakana
// ============================================================
export const getKanaLessons = async (type) => {
  const { data } = await apiClient.get(`/api/reading/kana/${type}`);
  return data.lessons;
};

// ============================================================
// GET KANJI LESSONS — ดึง lesson list สำหรับคันจิตามระดับ JLPT
// ============================================================
export const getKanjiLessons = async (level) => {
  const { data } = await apiClient.get(`/api/reading/kanji/${level}`);
  return data.lessons;
};

// ============================================================
// GET LESSON BY ID — ดึงบทเรียนเต็มพร้อม characters และ quiz
// ============================================================
export const getLessonById = async (id) => {
  const { data } = await apiClient.get(`/api/reading/lesson/${id}`);
  return data.lesson;
};
