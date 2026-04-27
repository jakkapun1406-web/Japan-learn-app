// ============================================================
// IMPORTS
// ============================================================
const { supabase } = require('../lib/supabaseClient');

// ============================================================
// CONSTANTS
// ============================================================
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// HELPERS — สุ่มลำดับ array (Fisher-Yates)
// ============================================================
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ============================================================
// GET LISTENING QUESTIONS — ดึงคำและสร้างข้อสอบ 4 ตัวเลือก
// GET /api/listening/questions/:level?limit=10
// ============================================================
const getListeningQuestions = async (req, res) => {
  const { level } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ error: 'Invalid level. Must be N5, N4, N3, N2, or N1' });
  }

  try {
    // ดึงคำจำนวนมากพอเพื่อสร้างตัวเลือก (target + distractors)
    const fetchCount = limit * 5;
    const { data, error } = await supabase
      .from('jlpt_vocab')
      .select('word, reading, meaning')
      .eq('jlpt_level', level)
      .limit(fetchCount * 2);

    if (error) throw error;

    if (!data || data.length < 4) {
      return res.status(404).json({ error: `Not enough vocab found for level ${level}` });
    }

    // กรองคำที่มี meaning ก่อน แล้วสุ่ม
    const pool = shuffle(data.filter((w) => w.meaning));

    // ถ้ามีน้อยกว่า 4 คำ ใช้ไม่ได้
    if (pool.length < 4) {
      return res.status(404).json({ error: `Not enough vocab with meanings for level ${level}` });
    }

    const targets = pool.slice(0, Math.min(limit, pool.length - 3));
    const distractorPool = pool.slice(targets.length);

    // สร้างข้อสอบ: แต่ละคำ = 1 target + 3 distractors จาก pool
    const questions = targets.map((target, i) => {
      // เลือก 3 distractors ที่มี meaning ต่างกัน
      const distractors = [];
      let di = 0;
      while (distractors.length < 3 && di < distractorPool.length) {
        const d = distractorPool[(i * 3 + di) % distractorPool.length];
        if (d.meaning !== target.meaning) {
          distractors.push(d.meaning);
        }
        di++;
      }
      // กรณีขาด distractor ใช้ซ้ำจาก pool ทั้งหมด
      while (distractors.length < 3) {
        distractors.push(pool[(i + distractors.length + 1) % pool.length].meaning);
      }

      const options = shuffle([target.meaning, ...distractors]);
      const correctIndex = options.indexOf(target.meaning);

      return {
        word: target.word,
        reading: target.reading,
        options,
        correctIndex,
      };
    });

    return res.status(200).json({ level, questions });
  } catch (err) {
    console.error('[getListeningQuestions]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getListeningQuestions };
