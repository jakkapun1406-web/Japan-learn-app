-- ============================================================
-- MIGRATION: สร้างตาราง jlpt_vocab (global reference data)
-- รัน script นี้ใน Supabase SQL Editor ครั้งเดียว
-- ============================================================

CREATE TABLE IF NOT EXISTS jlpt_vocab (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  word          TEXT        NOT NULL,
  reading       TEXT        NOT NULL,
  meaning       TEXT        NOT NULL,
  part_of_speech TEXT,
  jlpt_level    TEXT        NOT NULL CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (word, jlpt_level)
);

-- ============================================================
-- RLS — อ่านได้ทุกคน (authenticated), เขียนได้แค่ service_role
-- ============================================================
ALTER TABLE jlpt_vocab ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read jlpt_vocab"
  ON jlpt_vocab
  FOR SELECT
  USING (auth.role() = 'authenticated');
