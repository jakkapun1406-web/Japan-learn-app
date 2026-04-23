// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// HELPERS
// ============================================================
const verifyDeckOwner = async (deckId, userId) => {
  const { data, error } = await supabase
    .from('user_decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();
  return !error && !!data;
};

// ============================================================
// GET VOCAB BY DECK — ดึงคำศัพท์ทั้งหมดใน deck
// ============================================================
const getVocabByDeck = async (req, res) => {
  const userId = req.user.id;
  const { deckId } = req.params;

  try {
    const owned = await verifyDeckOwner(deckId, userId);
    if (!owned) return res.status(404).json({ error: 'Deck not found' });

    const { data, error } = await supabase
      .from('vocab_cards')
      .select('*')
      .eq('deck_id', deckId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ cards: data });
  } catch (err) {
    console.error('[getVocabByDeck]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// ADD VOCAB CARD — เพิ่มคำศัพท์ใหม่เข้า deck
// ============================================================
const addVocabCard = async (req, res) => {
  const userId = req.user.id;
  const { deckId } = req.params;
  const { word, reading, meaning, part_of_speech, jlpt_level } = req.body;

  // --- VALIDATION ---
  if (!word || !reading || !meaning) {
    return res.status(400).json({ error: 'word, reading, and meaning are required' });
  }

  try {
    const owned = await verifyDeckOwner(deckId, userId);
    if (!owned) return res.status(404).json({ error: 'Deck not found' });

    const { data, error } = await supabase
      .from('vocab_cards')
      .insert({ deck_id: deckId, user_id: userId, word, reading, meaning, part_of_speech, jlpt_level })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ card: data });
  } catch (err) {
    console.error('[addVocabCard]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// DELETE VOCAB CARD — ลบคำศัพท์ (cascade ลบ review_log ด้วย)
// ============================================================
const deleteVocabCard = async (req, res) => {
  const userId = req.user.id;
  const { cardId } = req.params;

  try {
    const { error } = await supabase
      .from('vocab_cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', userId);

    if (error) throw error;

    return res.status(200).json({ message: 'Card deleted' });
  } catch (err) {
    console.error('[deleteVocabCard]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getVocabByDeck, addVocabCard, deleteVocabCard };
