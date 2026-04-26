// ============================================================
// IMPORTS
// ============================================================
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically

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
module.exports = { getGrammarExplain };
