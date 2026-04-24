-- ============================================================
-- MIGRATION: เพิ่ม deck_type ใน user_decks
-- รัน script นี้ใน Supabase SQL Editor
-- ============================================================

ALTER TABLE user_decks
  ADD COLUMN IF NOT EXISTS deck_type TEXT NOT NULL DEFAULT 'user'
    CHECK (deck_type IN ('jlpt', 'user'));

-- Deck ที่มีอยู่แล้วจะได้ deck_type = 'user' โดยอัตโนมัติ
