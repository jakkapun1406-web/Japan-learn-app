// ============================================================
// IMPORTS
// ============================================================
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically

// ============================================================
// GET VOCAB HINT — ดึง AI hint สำหรับคำศัพท์ (mnemonic + ตัวอย่าง + คำที่เกี่ยวข้อง)
// ============================================================
const getVocabHint = async (req, res) => {
  const { word, reading, meaning } = req.body;

  if (!word || !reading || !meaning) {
    return res.status(400).json({ error: 'word, reading และ meaning จำเป็นต้องระบุ' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a Japanese language tutor helping a Thai-speaking student memorise vocabulary.
The student is learning: "${word}" (${reading}) — meaning: "${meaning}".

Reply in JSON with exactly this shape (no markdown fences):
{"mnemonic":"A short memorable trick or story to remember this word (write in Thai or use simple English if the trick relies on sound)","example":{"japanese":"A natural example sentence using ${word}","reading":"Furigana/romaji reading of the sentence","thai":"Thai translation of the sentence"},"related":["word1","word2","word3"]}`,
        },
      ],
    });

    const text = message.content[0].text;

    let hint;
    try {
      hint = JSON.parse(text);
    } catch {
      // Graceful degradation: return raw text as mnemonic
      hint = { mnemonic: text, example: null, related: [] };
    }

    return res.json({ hint });
  } catch (err) {
    console.error('getVocabHint error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GET GRAMMAR EXPLAIN — ดึง AI อธิบายไวยากรณ์เชิงลึก
// ============================================================
const getGrammarExplain = async (req, res) => {
  const { grammarTitle, japanese, reading, thai } = req.body;

  if (!grammarTitle || !japanese || !reading || !thai) {
    return res.status(400).json({ error: 'grammarTitle, japanese, reading และ thai จำเป็นต้องระบุ' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 768,
      messages: [
        {
          role: 'user',
          content: `You are a Japanese grammar teacher explaining to a Thai-speaking student.
Grammar point: "${grammarTitle}"
Example sentence: "${japanese}" (${reading}) — "${thai}"

Reply in JSON with exactly this shape (no markdown fences):
{"deeperExplanation":"A 2-3 sentence explanation of why this grammar pattern applies here, written in Thai","breakdown":[{"part":"the Japanese segment","role":"What grammatical role it plays, in Thai"}],"commonMistakes":["Mistake 1 in Thai","Mistake 2 in Thai"]}`,
        },
      ],
    });

    const text = message.content[0].text;

    let explanation;
    try {
      explanation = JSON.parse(text);
    } catch {
      explanation = { deeperExplanation: text, breakdown: [], commonMistakes: [] };
    }

    return res.json({ explanation });
  } catch (err) {
    console.error('getGrammarExplain error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = { getVocabHint, getGrammarExplain };
