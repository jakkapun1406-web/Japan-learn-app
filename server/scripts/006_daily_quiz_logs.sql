-- ============================================================
-- MIGRATION 006 — daily_quiz_logs table
-- ============================================================
-- บันทึกผลตอบคำศัพท์ประจำวัน: 1 row ต่อ (user, word, วันที่)
-- UNIQUE constraint ป้องกันคำซ้ำในวันเดียวกัน
-- ============================================================

CREATE TABLE daily_quiz_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL,
  word_id    UUID        NOT NULL,
  quiz_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  is_correct BOOLEAN     NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, word_id, quiz_date)
);

ALTER TABLE daily_quiz_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_quiz_logs_self" ON daily_quiz_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_daily_quiz_logs_user_date
  ON daily_quiz_logs(user_id, quiz_date);
