// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// CONSTANTS
// ============================================================
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// GET JLPT VOCAB — ดึงรายการคำศัพท์จากคลังกลาง
// GET /api/jlpt-vocab/:level
// ============================================================
const getJlptVocab = async (req, res) => {
  const { level } = req.params;

  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ error: 'Invalid level. Must be N5, N4, N3, N2, or N1' });
  }

  try {
    const { data, error, count } = await supabase
      .from('jlpt_vocab')
      .select('*', { count: 'exact' })
      .eq('jlpt_level', level)
      .order('word', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ level, count, vocab: data });
  } catch (err) {
    console.error('[getJlptVocab]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// IMPORT VOCAB — copy คำศัพท์จากคลังกลาง → vocab_cards ของ user
// POST /api/decks/:deckId/import
// Body: { jlpt_level: "N5" }
// ============================================================
const importVocab = async (req, res) => {
  const userId = req.user.id;
  const { deckId } = req.params;
  const { jlpt_level } = req.body;

  // --- VALIDATION ---
  if (!jlpt_level || !VALID_LEVELS.includes(jlpt_level)) {
    return res.status(400).json({ error: 'jlpt_level must be N5, N4, N3, N2, or N1' });
  }

  try {
    // ตรวจว่า deck เป็นของ user จริง
    const { data: deck, error: deckErr } = await supabase
      .from('user_decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (deckErr || !deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // ดึง vocab จากคลังกลาง
    const { data: sourceVocab, error: srcErr } = await supabase
      .from('jlpt_vocab')
      .select('word, reading, meaning, part_of_speech, jlpt_level')
      .eq('jlpt_level', jlpt_level);

    if (srcErr) throw srcErr;
    if (!sourceVocab || sourceVocab.length === 0) {
      return res.status(404).json({ error: `No vocab found for level ${jlpt_level}` });
    }

    // แปลง → vocab_cards rows (เพิ่ม deck_id, user_id)
    const rows = sourceVocab.map((v) => ({
      deck_id: deckId,
      user_id: userId,
      word: v.word,
      reading: v.reading,
      meaning: v.meaning,
      part_of_speech: v.part_of_speech,
      jlpt_level: v.jlpt_level,
    }));

    // upsert — ถ้า word+deck_id ซ้ำ ให้ข้ามไป (ไม่ทับของเดิม)
    const { data: inserted, error: insertErr } = await supabase
      .from('vocab_cards')
      .upsert(rows, { onConflict: 'word,deck_id', ignoreDuplicates: true })
      .select('id');

    if (insertErr) throw insertErr;

    return res.status(200).json({
      message: `Import complete`,
      imported: inserted?.length ?? 0,
      total_available: sourceVocab.length,
    });
  } catch (err) {
    console.error('[importVocab]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getJlptVocab, importVocab };
