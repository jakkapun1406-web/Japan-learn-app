// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// HELPERS
// ============================================================
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// GET WORDS — ดึงคำศัพท์ของ user ที่ยังไม่ได้ตอบวันนี้ (สูงสุด 50 คำ)
// Query param: ?level=N5  (ถ้าไม่ส่ง = ทั้งหมด)
// ============================================================
const getWords = async (req, res) => {
  const userId = req.user.id;
  const today  = new Date().toISOString().slice(0, 10);
  const level  = VALID_LEVELS.includes(req.query.level) ? req.query.level : null;

  try {
    // --- ดึง word_id ที่ตอบไปแล้ววันนี้ ---
    const { data: answered, error: answeredError } = await supabase
      .from('daily_quiz_logs')
      .select('word_id')
      .eq('user_id', userId)
      .eq('quiz_date', today);

    if (answeredError) throw answeredError;

    // --- ถ้ากรอง level ให้นับเฉพาะคำที่ตอบแล้วในระดับนั้น ---
    let answeredIds = answered.map((r) => r.word_id);

    if (level && answeredIds.length > 0) {
      // กรองเฉพาะ word_id ที่เป็น vocab_cards ระดับนั้น
      const { data: levelAnswered } = await supabase
        .from('vocab_cards')
        .select('id')
        .eq('user_id', userId)
        .eq('jlpt_level', level)
        .in('id', answeredIds);

      answeredIds = (levelAnswered ?? []).map((r) => r.id);
    }

    // --- ดึงคำศัพท์จาก vocab_cards ของ user ---
    let query = supabase
      .from('vocab_cards')
      .select('id, word, reading, meaning, part_of_speech, jlpt_level')
      .eq('user_id', userId)
      .limit(300);

    if (level) query = query.eq('jlpt_level', level);

    if (answeredIds.length > 0) {
      query = query.not('id', 'in', `(${answeredIds.join(',')})`);
    }

    const { data: words, error: wordsError } = await query;

    if (wordsError) throw wordsError;

    const shuffled = words.sort(() => Math.random() - 0.5).slice(0, 50);

    return res.status(200).json({ words: shuffled, remaining: shuffled.length });
  } catch (err) {
    console.error('[getWords]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// SUBMIT ANSWER — บันทึกผลตอบคำ (รู้/ไม่รู้)
// ============================================================
const submitAnswer = async (req, res) => {
  const userId = req.user.id;
  const { word_id, is_correct } = req.body;
  const today = new Date().toISOString().slice(0, 10);

  if (!word_id || is_correct === undefined) {
    return res.status(400).json({ error: 'word_id and is_correct are required' });
  }

  try {
    const { error } = await supabase
      .from('daily_quiz_logs')
      .upsert(
        { user_id: userId, word_id, quiz_date: today, is_correct },
        { onConflict: 'user_id,word_id,quiz_date' }
      );

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[submitAnswer]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GET STATUS — สถิติประจำวัน + total คำในระดับที่เลือก
// Query param: ?level=N5  (ถ้าไม่ส่ง = ทั้งหมด → returns byLevel too)
// ============================================================
const getStatus = async (req, res) => {
  const userId = req.user.id;
  const today  = new Date().toISOString().slice(0, 10);
  const level  = VALID_LEVELS.includes(req.query.level) ? req.query.level : null;

  try {
    // นับคำศัพท์ทั้งหมดของ user ในระดับที่เลือก
    let countQuery = supabase
      .from('vocab_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (level) countQuery = countQuery.eq('jlpt_level', level);

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    const total = Math.min(count ?? 0, 50);

    // ดึงคำที่ตอบไปแล้ววันนี้
    const { data: logs, error: logsError } = await supabase
      .from('daily_quiz_logs')
      .select('word_id, is_correct')
      .eq('user_id', userId)
      .eq('quiz_date', today);

    if (logsError) throw logsError;

    // --- คำนวณ answered/correct โดยรวม ---
    let answered = 0;
    let correct  = 0;

    if (logs.length > 0) {
      if (level) {
        // กรองเฉพาะ log ที่เป็น vocab_cards ของ level นั้น
        const logIds = logs.map((r) => r.word_id);
        const { data: levelCards } = await supabase
          .from('vocab_cards')
          .select('id')
          .eq('user_id', userId)
          .eq('jlpt_level', level)
          .in('id', logIds);

        const levelCardIds = new Set((levelCards ?? []).map((c) => c.id));
        const levelLogs    = logs.filter((r) => levelCardIds.has(r.word_id));

        answered = levelLogs.length;
        correct  = levelLogs.filter((r) => r.is_correct).length;
      } else {
        answered = logs.length;
        correct  = logs.filter((r) => r.is_correct).length;
      }
    }

    // --- specific level: คืนผลทันที ---
    if (level) {
      return res.status(200).json({ answered, correct, total });
    }

    // --- ทั้งหมด: คำนวณ byLevel breakdown ---
    // ใช้ per-level queries แทน allCards เพราะ Supabase default limit 1000 rows
    // จะทำให้ขาดข้อมูลเมื่อ user มี vocab_cards หลายพัน (N5+N4+...=8000+)
    const logIds = logs.length > 0 ? logs.map((l) => l.word_id) : [];

    const byLevelEntries = await Promise.all(
      VALID_LEVELS.map(async (lvl) => {
        // นับ vocab_cards ทั้งหมดของ level นี้
        const { count: lvlCount } = await supabase
          .from('vocab_cards')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('jlpt_level', lvl);

        const lvlTotal = Math.min(lvlCount ?? 0, 50);

        if (logIds.length === 0) {
          return [lvl, { answered: 0, correct: 0, total: lvlTotal }];
        }

        // หา word_id ที่ตอบวันนี้และเป็น level นี้
        const { data: lvlCards } = await supabase
          .from('vocab_cards')
          .select('id')
          .eq('user_id', userId)
          .eq('jlpt_level', lvl)
          .in('id', logIds);

        const lvlCardIds = new Set((lvlCards ?? []).map((c) => c.id));
        const lvlLogs    = logs.filter((l) => lvlCardIds.has(l.word_id));

        return [lvl, {
          answered: lvlLogs.length,
          correct:  lvlLogs.filter((l) => l.is_correct).length,
          total:    lvlTotal,
        }];
      })
    );

    const byLevel = Object.fromEntries(byLevelEntries);

    return res.status(200).json({ answered, correct, total, byLevel });
  } catch (err) {
    console.error('[getStatus]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getWords, submitAnswer, getStatus };
