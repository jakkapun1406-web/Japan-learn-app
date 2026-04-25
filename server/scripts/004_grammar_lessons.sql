-- ============================================================
-- MIGRATION 004 — grammar_lessons table
-- รัน SQL นี้ใน Supabase SQL Editor
-- ============================================================


-- ============================================================
-- TABLE: grammar_lessons
-- บทเรียนไวยากรณ์ภาษาญี่ปุ่น แยกตาม JLPT level
-- ============================================================
CREATE TABLE grammar_lessons (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  jlpt_level   TEXT        NOT NULL CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  title        TEXT        NOT NULL,       -- เช่น "は vs が — subject markers"
  explanation  TEXT        NOT NULL,       -- คำอธิบายภาษาไทย
  examples     JSONB       NOT NULL,       -- [{ japanese, reading, thai }]
  quiz         JSONB       NOT NULL,       -- [{ question, options[4], answer_index }]
  sort_order   INT         DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()  NOT NULL,
  UNIQUE (jlpt_level, title)
);


-- ============================================================
-- ROW LEVEL SECURITY — อ่านได้ทุก user (ไม่ต้อง login ก็ได้)
-- แต่ INSERT/UPDATE/DELETE ต้องทำผ่าน service_role เท่านั้น
-- ============================================================
ALTER TABLE grammar_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grammar_lessons_read_all" ON grammar_lessons
  FOR SELECT USING (true);


-- ============================================================
-- INDEX — เร็วขึ้นเมื่อ filter ตาม jlpt_level + sort_order
-- ============================================================
CREATE INDEX idx_grammar_lessons_level ON grammar_lessons(jlpt_level, sort_order);
