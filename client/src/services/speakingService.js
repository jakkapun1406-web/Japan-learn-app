// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET SPEAKING WORDS — ดึงคำศัพท์สุ่มสำหรับฝึกออกเสียง
// ============================================================
export const getSpeakingWords = async (level, limit = 10) => {
  const { data } = await apiClient.get(`/api/speaking/words/${level}`, {
    params: { limit },
  });
  return data.words;
};
