// ============================================================
// IMPORTS
// ============================================================
const { createClient } = require('@supabase/supabase-js');

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// CONSTANTS
// ============================================================
const VALID_KANA_TYPES = ['hiragana', 'katakana'];
const VALID_JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// GET KANA LESSONS — ดึง lesson list สำหรับ hiragana หรือ katakana
// ============================================================
async function getKanaLessons(req, res) {
  const { type } = req.params;

  if (!VALID_KANA_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Use hiragana or katakana.' });
  }

  const { data, error } = await supabase
    .from('reading_lessons')
    .select('id, lesson_type, title, sort_order')
    .eq('lesson_type', type)
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ type, lessons: data });
}

// ============================================================
// GET KANJI LESSONS — ดึง lesson list สำหรับคันจิตามระดับ JLPT
// ============================================================
async function getKanjiLessons(req, res) {
  const level = req.params.level.toUpperCase();

  if (!VALID_JLPT_LEVELS.includes(level)) {
    return res.status(400).json({ error: 'Invalid level. Use N5, N4, N3, N2, or N1.' });
  }

  const { data, error } = await supabase
    .from('reading_lessons')
    .select('id, lesson_type, jlpt_level, title, sort_order')
    .eq('lesson_type', 'kanji')
    .eq('jlpt_level', level)
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ level, lessons: data });
}

// ============================================================
// GET LESSON BY ID — ดึงบทเรียนเต็มพร้อม characters และ quiz
// ============================================================
async function getLessonById(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('reading_lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Lesson not found.' });

  res.json({ lesson: data });
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getKanaLessons, getKanjiLessons, getLessonById };
