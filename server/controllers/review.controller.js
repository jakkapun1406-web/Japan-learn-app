// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// HELPERS — คำนวณ interval ถัดไป (logic เดียวกับ srsAlgorithm.js)
// ============================================================
const calculateNextInterval = (currentInterval, grade) => {
  switch (grade) {
    case 0: return 1;                                    // ลืม — reset
    case 1: return Math.max(1, currentInterval - 1);    // ยาก — ลดลง
    case 2: return currentInterval * 2;                  // จำได้ — x2
    case 3: return currentInterval * 3;                  // ดีมาก — x3
    default: return 1;
  }
};

// ============================================================
// GET DUE CARDS — ดึงการ์ดสำหรับ review
// ?mode=due  (default) — เฉพาะที่ถึงเวลาแล้ว
// ?mode=all            — ทุกใบใน deck ไม่ว่าจะถึงเวลาหรือไม่
// ============================================================
const getDueCards = async (req, res) => {
  const userId = req.user.id;
  const { deckId } = req.params;
  const mode = req.query.mode === 'all' ? 'all' : 'due';
  const now = new Date().toISOString();

  try {
    // --- VERIFY DECK OWNERSHIP ---
    const { data: deck, error: deckError } = await supabase
      .from('user_decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (deckError || !deck) return res.status(404).json({ error: 'Deck not found' });

    // --- GET VOCAB พร้อม review_log ของแต่ละใบ (left join) ---
    const { data: cards, error: cardsError } = await supabase
      .from('vocab_cards')
      .select(`
        *,
        review_logs ( interval_days, repetitions, next_review_at, last_reviewed_at )
      `)
      .eq('deck_id', deckId)
      .eq('user_id', userId);

    if (cardsError) throw cardsError;

    // --- FILTER ตาม mode ---
    const filtered = cards
      .filter(card => {
        if (mode === 'all') return true;
        const log = card.review_logs?.[0];
        return !log || log.next_review_at <= now;
      })
      .map(card => {
        const log = card.review_logs?.[0] || null;
        const { review_logs, ...cardData } = card;
        return { ...cardData, review_log: log };
      });

    return res.status(200).json({ cards: filtered, total: filtered.length, mode });
  } catch (err) {
    console.error('[getDueCards]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// SUBMIT REVIEW — รับผล grade แล้ว upsert review_log
// ============================================================
const submitReview = async (req, res) => {
  const userId = req.user.id;
  const { card_id, grade } = req.body;

  // --- VALIDATION ---
  if (!card_id || grade === undefined) {
    return res.status(400).json({ error: 'card_id and grade are required' });
  }
  if (![0, 1, 2, 3].includes(grade)) {
    return res.status(400).json({ error: 'grade must be 0, 1, 2, or 3' });
  }

  try {
    // --- VERIFY CARD OWNERSHIP ---
    const { data: card, error: cardError } = await supabase
      .from('vocab_cards')
      .select('id')
      .eq('id', card_id)
      .eq('user_id', userId)
      .single();

    if (cardError || !card) return res.status(404).json({ error: 'Card not found' });

    // --- GET EXISTING LOG ---
    const { data: existingLog } = await supabase
      .from('review_logs')
      .select('interval_days, repetitions')
      .eq('user_id', userId)
      .eq('card_id', card_id)
      .single();

    // --- CALCULATE NEXT INTERVAL ---
    const currentInterval = existingLog?.interval_days || 1;
    const currentReps = existingLog?.repetitions || 0;
    const nextInterval = calculateNextInterval(currentInterval, grade);
    const nextRepetitions = grade >= 2 ? currentReps + 1 : 0;

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval);

    // --- UPSERT REVIEW LOG ---
    const { data, error } = await supabase
      .from('review_logs')
      .upsert(
        {
          user_id: userId,
          card_id,
          interval_days: nextInterval,
          repetitions: nextRepetitions,
          next_review_at: nextReviewAt.toISOString(),
          last_reviewed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,card_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ review_log: data });
  } catch (err) {
    console.error('[submitReview]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getDueCards, submitReview };
