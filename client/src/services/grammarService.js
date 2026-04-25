// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET LESSONS — ดึงรายการบทเรียนทั้งหมดของ 1 ระดับ
// ============================================================
export const getLessons = async (level) => {
  const { data } = await apiClient.get(`/api/grammar/${level}`);
  return data.lessons;
};

// ============================================================
// GET LESSON BY ID — ดึงบทเรียนพร้อม examples และ quiz
// ============================================================
export const getLessonById = async (id) => {
  const { data } = await apiClient.get(`/api/grammar/lesson/${id}`);
  return data.lesson;
};
