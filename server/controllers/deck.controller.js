// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// CONSTANTS
// ============================================================
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// GET DECKS — ดึง deck ทั้งหมดของ user (กรองตาม jlpt_level ได้)
// ============================================================
const getDecks = async (req, res) => {
  const userId = req.user.id;
  const { jlpt_level } = req.query;

  try {
    let query = supabase
      .from('user_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (jlpt_level) {
      if (!VALID_LEVELS.includes(jlpt_level)) {
        return res.status(400).json({ error: 'Invalid jlpt_level' });
      }
      query = query.eq('jlpt_level', jlpt_level);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ decks: data });
  } catch (err) {
    console.error('[getDecks]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// CREATE DECK — สร้าง deck ใหม่
// ============================================================
const createDeck = async (req, res) => {
  const userId = req.user.id;
  const { name, jlpt_level } = req.body;

  // --- VALIDATION ---
  if (!name || !jlpt_level) {
    return res.status(400).json({ error: 'name and jlpt_level are required' });
  }
  if (!VALID_LEVELS.includes(jlpt_level)) {
    return res.status(400).json({ error: 'jlpt_level must be N5, N4, N3, N2, or N1' });
  }

  try {
    const { data, error } = await supabase
      .from('user_decks')
      .insert({ user_id: userId, name, jlpt_level })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ deck: data });
  } catch (err) {
    console.error('[createDeck]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// DELETE DECK — ลบ deck (cascade ลบ vocab_cards และ review_logs ด้วย)
// ============================================================
const deleteDeck = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('user_decks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.status(200).json({ message: 'Deck deleted' });
  } catch (err) {
    console.error('[deleteDeck]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getDecks, createDeck, deleteDeck };
