// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// CONSTANTS
// ============================================================
const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// INIT JLPT DECKS — สร้าง deck N5–N1 ให้ user ถ้ายังไม่มี
// POST /api/jlpt-decks/init
// ============================================================
const initJlptDecks = async (req, res) => {
  const userId = req.user.id;

  try {
    // ดึง jlpt decks ที่ user มีอยู่แล้ว
    const { data: existing, error: fetchErr } = await supabase
      .from('user_decks')
      .select('jlpt_level')
      .eq('user_id', userId)
      .eq('deck_type', 'jlpt');

    if (fetchErr) throw fetchErr;

    const existingLevels = new Set((existing || []).map((d) => d.jlpt_level));
    const levelsToCreate = JLPT_LEVELS.filter((l) => !existingLevels.has(l));

    if (levelsToCreate.length === 0) {
      return res.status(200).json({ initialized: [], message: 'JLPT decks already exist' });
    }

    const initialized = [];

    for (const level of levelsToCreate) {
      // --- สร้าง deck ---
      const { data: deck, error: deckErr } = await supabase
        .from('user_decks')
        .insert({
          user_id: userId,
          name: `JLPT ${level}`,
          jlpt_level: level,
          deck_type: 'jlpt',
        })
        .select()
        .single();

      if (deckErr) throw deckErr;

      // --- ดึง vocab จากคลังกลาง ---
      const { data: vocab, error: vocabErr } = await supabase
        .from('jlpt_vocab')
        .select('word, reading, meaning, part_of_speech, jlpt_level')
        .eq('jlpt_level', level);

      if (vocabErr) throw vocabErr;

      if (vocab && vocab.length > 0) {
        // --- copy → vocab_cards (upsert ป้องกัน duplicate) ---
        const rows = vocab.map((v) => ({
          deck_id: deck.id,
          user_id: userId,
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          part_of_speech: v.part_of_speech,
          jlpt_level: v.jlpt_level,
        }));

        // upsert เป็น batch ละ 100
        const BATCH = 100;
        for (let i = 0; i < rows.length; i += BATCH) {
          const batch = rows.slice(i, i + BATCH);
          const { error: insertErr } = await supabase
            .from('vocab_cards')
            .upsert(batch, { onConflict: 'word,deck_id', ignoreDuplicates: true });
          if (insertErr) throw insertErr;
        }
      }

      initialized.push({ level, deck_id: deck.id, vocab_count: vocab?.length ?? 0 });
    }

    return res.status(200).json({ initialized });
  } catch (err) {
    console.error('[initJlptDecks]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { initJlptDecks };
