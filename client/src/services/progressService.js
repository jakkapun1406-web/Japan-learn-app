// ============================================================
// IMPORTS
// ============================================================
import apiClient from './apiClient';

// ============================================================
// GET PROGRESS STATS — ดึงสถิติความก้าวหน้าของผู้ใช้
// ============================================================
export const getProgressStats = async () => {
  const { data } = await apiClient.get('/api/progress/stats');
  return data.stats;
};
