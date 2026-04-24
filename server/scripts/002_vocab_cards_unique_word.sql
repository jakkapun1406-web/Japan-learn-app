-- ============================================================
-- MIGRATION: เพิ่ม unique constraint ใน vocab_cards
-- จำเป็นสำหรับ upsert ตอน import (onConflict: 'word,deck_id')
-- รัน script นี้ใน Supabase SQL Editor
-- ============================================================

ALTER TABLE vocab_cards
  ADD CONSTRAINT vocab_cards_word_deck_unique UNIQUE (word, deck_id);
