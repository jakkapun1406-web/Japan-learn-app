-- ============================================================
-- MIGRATION 005 — reading_lessons table
-- Phase 8: Kana/Kanji Reading Practice module
-- Run this in Supabase SQL Editor before seeding or starting server
-- ============================================================

CREATE TABLE reading_lessons (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_type  TEXT        NOT NULL CHECK (lesson_type IN ('hiragana','katakana','kanji')),
  jlpt_level   TEXT        CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  title        TEXT        NOT NULL,
  explanation  TEXT        NOT NULL,
  characters   JSONB       NOT NULL,
  -- [{ char, romaji, stroke_order_hint, examples: [{word, reading, meaning_thai}] }]
  quiz         JSONB       NOT NULL,
  -- [{ question, options: [4 strings], answer_index }]
  sort_order   INT         DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (lesson_type, title),
  CONSTRAINT kanji_needs_level CHECK (
    (lesson_type = 'kanji' AND jlpt_level IS NOT NULL)
    OR (lesson_type IN ('hiragana','katakana') AND jlpt_level IS NULL)
  )
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE reading_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reading_lessons_read_all" ON reading_lessons FOR SELECT USING (true);

-- ============================================================
-- INDEX — filter by type + level + sort_order
-- ============================================================
CREATE INDEX idx_reading_lessons_type_level ON reading_lessons(lesson_type, jlpt_level, sort_order);
