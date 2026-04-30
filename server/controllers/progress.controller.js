// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// GET PROGRESS STATS — รวมสถิติการเรียนรู้ของผู้ใช้
// ============================================================
const getProgressStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // ---- QUERY 1: vocab cards --------------------------------
    const { data: cards, error: cardsErr } = await supabase
      .from('vocab_cards')
      .select('id, jlpt_level')
      .eq('user_id', userId);

    if (cardsErr) throw cardsErr;

    // ---- QUERY 2: review logs --------------------------------
    const { data: logs, error: logsErr } = await supabase
      .from('review_logs')
      .select('card_id, interval_days, last_reviewed_at, next_review_at')
      .eq('user_id', userId);

    if (logsErr) throw logsErr;

    // ---- DERIVE STATS ----------------------------------------
    const now = new Date();

    const reviewedCardIds = new Set(logs.map((l) => l.card_id));

    const totalCards      = cards.length;
    const cardsMastered   = logs.filter((l) => l.interval_days >= 7).length;
    const totalReviews    = logs.length;
    const totalStudyDays  = new Set(
      logs.map((l) => l.last_reviewed_at?.slice(0, 10)).filter(Boolean)
    ).size;

    // Due = cards with next_review_at <= now OR cards never reviewed
    const dueFromLogs = logs.filter(
      (l) => new Date(l.next_review_at) <= now
    ).length;
    const neverReviewed = cards.filter((c) => !reviewedCardIds.has(c.id)).length;
    const cardsDueToday = dueFromLogs + neverReviewed;

    // ---- STREAK ALGORITHM ------------------------------------
    // Collect unique review dates (YYYY-MM-DD) from last_reviewed_at
    const dateSet = new Set(
      logs.map((l) => l.last_reviewed_at?.slice(0, 10)).filter(Boolean)
    );
    const todayStr     = now.toISOString().slice(0, 10);
    const yesterdayStr = new Date(now - 86400000).toISOString().slice(0, 10);

    // Start from today; fall back to yesterday if no review today yet
    let streakDate = dateSet.has(todayStr) ? todayStr : yesterdayStr;
    let reviewStreak = 0;

    while (dateSet.has(streakDate)) {
      reviewStreak++;
      const d = new Date(streakDate);
      d.setDate(d.getDate() - 1);
      streakDate = d.toISOString().slice(0, 10);
    }

    // ---- BY-LEVEL BREAKDOWN ----------------------------------
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const byLevel = {};

    const logMap = {};
    for (const l of logs) logMap[l.card_id] = l;

    for (const lvl of levels) {
      const levelCards   = cards.filter((c) => c.jlpt_level === lvl);
      const levelCardIds = new Set(levelCards.map((c) => c.id));
      const masteredCount = logs.filter(
        (l) => levelCardIds.has(l.card_id) && l.interval_days >= 7
      ).length;
      const dueCount = levelCards.filter((c) => {
        const log = logMap[c.id];
        if (!log) return true;
        return new Date(log.next_review_at) <= now;
      }).length;

      byLevel[lvl] = { total: levelCards.length, mastered: masteredCount, due: dueCount };
    }

    // ---- RESPONSE --------------------------------------------
    return res.json({
      stats: {
        totalCards,
        cardsMastered,
        cardsDueToday,
        totalReviews,
        reviewStreak,
        totalStudyDays,
        byLevel,
      },
    });
  } catch (err) {
    console.error('getProgressStats error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getProgressStats };
