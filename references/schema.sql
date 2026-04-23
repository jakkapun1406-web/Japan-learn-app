-- ============================================================
-- DATABASE SCHEMA — Japanese Learning App
-- รัน SQL นี้ใน Supabase SQL Editor (ทีละ section)
-- ============================================================


-- ============================================================
-- TABLE: user_decks
-- deck ของแต่ละ user แยกตาม JLPT level
-- ============================================================
CREATE TABLE user_decks (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT        NOT NULL,
  jlpt_level   TEXT        NOT NULL CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ============================================================
-- TABLE: vocab_cards
-- คำศัพท์ใน deck — word, reading, meaning
-- ============================================================
CREATE TABLE vocab_cards (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id        UUID        REFERENCES user_decks(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word           TEXT        NOT NULL,   -- kanji / kana เช่น 食べる
  reading        TEXT        NOT NULL,   -- hiragana เช่น たべる
  meaning        TEXT        NOT NULL,   -- ความหมาย เช่น กิน / to eat
  part_of_speech TEXT,                   -- noun / verb / adjective / adverb
  jlpt_level     TEXT        CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ============================================================
-- TABLE: review_logs
-- ข้อมูล SRS ต่อ card ต่อ user — interval, next_review_at
-- ============================================================
CREATE TABLE review_logs (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id          UUID        REFERENCES vocab_cards(id) ON DELETE CASCADE NOT NULL,
  interval_days    INT         DEFAULT 1   NOT NULL,  -- ตรงกับ srsAlgorithm interval_days
  repetitions      INT         DEFAULT 0   NOT NULL,  -- จำนวนครั้งที่รีวิวสำเร็จ
  next_review_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- ตรงกับ srsAlgorithm next_review_at
  last_reviewed_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, card_id)  -- 1 log ต่อ card ต่อ user
);


-- ============================================================
-- INDEXES — เพิ่ม performance สำหรับ query ที่ใช้บ่อย
-- ============================================================
CREATE INDEX idx_user_decks_user_id      ON user_decks(user_id);
CREATE INDEX idx_user_decks_jlpt_level   ON user_decks(jlpt_level);

CREATE INDEX idx_vocab_cards_deck_id     ON vocab_cards(deck_id);
CREATE INDEX idx_vocab_cards_user_id     ON vocab_cards(user_id);

CREATE INDEX idx_review_logs_user_id     ON review_logs(user_id);
CREATE INDEX idx_review_logs_card_id     ON review_logs(card_id);
CREATE INDEX idx_review_logs_next_review ON review_logs(next_review_at);  -- query "due cards"


-- ============================================================
-- TRIGGER: auto-update updated_at สำหรับ user_decks
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_decks_updated_at
  BEFORE UPDATE ON user_decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- user เห็นและแก้ไขได้เฉพาะ row ของตัวเองเท่านั้น
-- ============================================================

-- user_decks
ALTER TABLE user_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_decks" ON user_decks
  FOR ALL USING (auth.uid() = user_id);

-- vocab_cards
ALTER TABLE vocab_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_vocab" ON vocab_cards
  FOR ALL USING (auth.uid() = user_id);

-- review_logs
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_reviews" ON review_logs
  FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- SAMPLE DATA — N5 vocab (ใช้ทดสอบ — ต้องมี deck ก่อน)
-- แทนที่ '<YOUR_DECK_ID>' และ '<YOUR_USER_ID>' ด้วยค่าจริง
-- ============================================================
/*
INSERT INTO vocab_cards (deck_id, user_id, word, reading, meaning, part_of_speech, jlpt_level)
VALUES
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '食べる',   'たべる',     'กิน',          'verb',      'N5'),
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '飲む',     'のむ',       'ดื่ม',         'verb',      'N5'),
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '水',       'みず',       'น้ำ',          'noun',      'N5'),
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '日本語',   'にほんご',   'ภาษาญี่ปุ่น', 'noun',      'N5'),
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '大きい',   'おおきい',   'ใหญ่',         'adjective', 'N5'),
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '小さい',   'ちいさい',   'เล็ก',         'adjective', 'N5'),
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '学校',     'がっこう',   'โรงเรียน',    'noun',      'N5'),
  ('<YOUR_DECK_ID>', '<YOUR_USER_ID>', '先生',     'せんせい',   'ครู / อาจารย์','noun',     'N5');
*/
