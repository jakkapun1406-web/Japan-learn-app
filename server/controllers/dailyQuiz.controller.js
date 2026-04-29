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
// Query param: ?level=N5  (ถ้าไม่ส่ง = ทั้งหมด)
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

    if (logs.length === 0) {
      return res.status(200).json({ answered: 0, correct: 0, total });
    }

    // ถ้ากรอง level ให้นับเฉพาะคำในระดับนั้น
    let answered = logs.length;
    let correct  = logs.filter((r) => r.is_correct).length;

    if (level) {
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
    }

    return res.status(200).json({ answered, correct, total });
  } catch (err) {
    console.error('[getStatus]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getWords, submitAnswer, getStatus };
