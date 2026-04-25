// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// CONSTANTS
// ============================================================
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// GET LESSONS — ดึงรายการบทเรียนทั้งหมดของ 1 ระดับ
// GET /api/grammar/:level
// ============================================================
const getLessons = async (req, res) => {
  const { level } = req.params;

  if (!VALID_LEVELS.includes(level.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid level. Must be N5, N4, N3, N2, or N1' });
  }

  try {
    const { data, error } = await supabase
      .from('grammar_lessons')
      .select('id, jlpt_level, title, sort_order, created_at')
      .eq('jlpt_level', level.toUpperCase())
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ level: level.toUpperCase(), lessons: data });
  } catch (err) {
    console.error('[getLessons]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GET LESSON BY ID — ดึงบทเรียนพร้อม examples และ quiz
// GET /api/grammar/lesson/:id
// ============================================================
const getLessonById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('grammar_lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    return res.status(200).json({ lesson: data });
  } catch (err) {
    console.error('[getLessonById]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getLessons, getLessonById };
