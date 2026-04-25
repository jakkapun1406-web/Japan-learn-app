// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// CONSTANTS
// ============================================================
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// GET SPEAKING WORDS — ดึงคำศัพท์แบบสุ่มสำหรับฝึกออกเสียง
// GET /api/speaking/words/:level?limit=10
// ============================================================
const getSpeakingWords = async (req, res) => {
  const { level } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ error: 'Invalid level. Must be N5, N4, N3, N2, or N1' });
  }

  try {
    const { data, error } = await supabase
      .from('jlpt_vocab')
      .select('word, reading, meaning, part_of_speech')
      .eq('jlpt_level', level);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: `No vocab found for level ${level}` });
    }

    // สุ่มลำดับแล้วตัดตาม limit — Supabase JS SDK ไม่รองรับ ORDER BY random() โดยตรง
    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, limit);

    return res.status(200).json({ level, words: shuffled });
  } catch (err) {
    console.error('[getSpeakingWords]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getSpeakingWords };
