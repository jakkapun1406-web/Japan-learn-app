// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET LISTENING QUESTIONS — ดึงข้อสอบฟังสำหรับ level ที่เลือก
// ============================================================
export const getListeningQuestions = async (level, limit = 10) => {
  const { data } = await apiClient.get(`/api/listening/questions/${level}`, {
    params: { limit },
  });
  return data.questions;
};
