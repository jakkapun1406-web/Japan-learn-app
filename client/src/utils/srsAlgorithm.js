// ============================================================
// SRS ALGORITHM — Simple Spaced Repetition
// ============================================================

// Grade: 0=ลืม, 1=ยาก, 2=จำได้, 3=ดีมาก
export function calculateNextReview(currentIntervalDays, grade) {
  let nextInterval;

  switch (grade) {
    case 0: // ลืม — reset เริ่มใหม่
      nextInterval = 1;
      break;
    case 1: // ยาก — ลดลงเล็กน้อย
      nextInterval = Math.max(1, currentIntervalDays - 1);
      break;
    case 2: // จำได้ — เพิ่มสองเท่า
      nextInterval = currentIntervalDays * 2;
      break;
    case 3: // ดีมาก — เพิ่มสามเท่า
      nextInterval = currentIntervalDays * 3;
      break;
    default:
      nextInterval = 1;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval);

  return {
    interval_days: nextInterval,
    next_review_at: nextReviewAt.toISOString(),
  };
}

export const GRADE_LABELS = {
  0: 'ลืม',
  1: 'ยาก',
  2: 'จำได้',
  3: 'ดีมาก',
};
