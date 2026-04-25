// ============================================================
// IMPORTS
// ============================================================
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ============================================================
// CLIENTS
// ============================================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ============================================================
// CONSTANTS — topic list per JLPT level
// ============================================================
const LESSON_TOPICS = {
  N5: [
    { title: 'は vs が — subject markers', sort_order: 1 },
    { title: 'を — object marker + verb structure', sort_order: 2 },
    { title: 'に と で — location particles', sort_order: 3 },
    { title: 'い-adjective conjugation (negative & past)', sort_order: 4 },
    { title: 'て-form verbs — connecting actions', sort_order: 5 },
  ],
  N4: [
    { title: 'てもいい / てはいけない — permission & prohibition', sort_order: 1 },
    { title: 'ている — ongoing actions & states', sort_order: 2 },
    { title: 'たことがある — past experience', sort_order: 3 },
    { title: 'ようにする / ようになる — effort & change', sort_order: 4 },
    { title: 'そうだ (hearsay vs appearance)', sort_order: 5 },
  ],
  N3: [
    { title: 'ために / ように — purpose clauses', sort_order: 1 },
    { title: 'ば / たら / なら — conditional forms', sort_order: 2 },
    { title: 'ばかり — just did / only', sort_order: 3 },
    { title: 'くれる / もらう / あげる — giving & receiving', sort_order: 4 },
    { title: 'のに — despite / unexpectedly', sort_order: 5 },
  ],
  N2: [
    { title: 'わけだ / わけではない — logical conclusion', sort_order: 1 },
    { title: 'にともなって / にしたがって — as, along with', sort_order: 2 },
    { title: 'にかかわらず — regardless of', sort_order: 3 },
    { title: 'うえで / うえに — in addition, on top of', sort_order: 4 },
    { title: 'としたら / とすれば — hypothetical conditionals', sort_order: 5 },
  ],
  N1: [
    { title: 'をもって — by means of, as of', sort_order: 1 },
    { title: 'いかんによらず / いかんにかかわらず — regardless of', sort_order: 2 },
    { title: 'にもまして — even more than', sort_order: 3 },
    { title: 'をおいて — there is no one but', sort_order: 4 },
    { title: 'ともなると / ともなれば — when it comes to', sort_order: 5 },
  ],
};

// ============================================================
// GENERATE LESSON — ใช้ Claude Haiku สร้างเนื้อหา 1 บทเรียน
// ============================================================
async function generateLesson(level, title) {
  const prompt = `สร้างบทเรียนไวยากรณ์ภาษาญี่ปุ่นสำหรับผู้เรียนชาวไทย

ระดับ: ${level}
หัวข้อ: ${title}

ตอบเป็น JSON เท่านั้น (ไม่มีข้อความอื่น):
{
  "explanation": "คำอธิบายภาษาไทย 3-5 ประโยค อธิบายการใช้งาน โครงสร้างประโยค และข้อควรระวัง",
  "examples": [
    { "japanese": "ประโยคภาษาญี่ปุ่น", "reading": "การอ่านแบบฮิรากานะ", "thai": "ความหมายภาษาไทย" },
    { "japanese": "ประโยคภาษาญี่ปุ่น", "reading": "การอ่านแบบฮิรากานะ", "thai": "ความหมายภาษาไทย" },
    { "japanese": "ประโยคภาษาญี่ปุ่น", "reading": "การอ่านแบบฮิรากานะ", "thai": "ความหมายภาษาไทย" }
  ],
  "quiz": [
    {
      "question": "คำถามภาษาไทยหรือญี่ปุ่น",
      "options": ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
      "answer_index": 0
    }
  ]
}

กฎ:
- explanation: ภาษาไทย อธิบายให้ชัดเจน ใช้งานได้จริง
- examples: 3 ประโยค ระดับ ${level} เหมาะสม
- quiz: 5 ข้อ หลากหลาย (เลือกคำ / แปลประโยค / บอกการใช้งาน) answer_index คือ index ของคำตอบที่ถูกใน options array (0-3)`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();

  // แกะ JSON จาก response (อาจมี ```json wrapper)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response for: ${title}`);

  return JSON.parse(jsonMatch[0]);
}

// ============================================================
// SEED LEVEL — สร้างบทเรียนทั้งหมดสำหรับ 1 ระดับ
// ============================================================
async function seedLevel(level) {
  const topics = LESSON_TOPICS[level];
  console.log(`\n[${level}] Generating ${topics.length} lessons...`);

  const rows = [];

  for (const topic of topics) {
    process.stdout.write(`  [${level}] "${topic.title}"... `);

    try {
      const content = await generateLesson(level, topic.title);

      rows.push({
        jlpt_level:  level,
        title:       topic.title,
        explanation: content.explanation,
        examples:    content.examples,
        quiz:        content.quiz,
        sort_order:  topic.sort_order,
      });

      process.stdout.write('done\n');
    } catch (err) {
      process.stdout.write(`FAILED — ${err.message}\n`);
    }

    // หน่วงเล็กน้อยเพื่อไม่ rate-limit
    await new Promise((r) => setTimeout(r, 500));
  }

  // upsert ทั้ง batch เข้า DB
  if (rows.length > 0) {
    const { error } = await supabase
      .from('grammar_lessons')
      .upsert(rows, { onConflict: 'jlpt_level,title', ignoreDuplicates: false });

    if (error) throw new Error(`[${level}] DB upsert failed: ${error.message}`);
  }

  console.log(`  [${level}] ${rows.length}/${topics.length} lessons upserted ✓`);
  return rows.length;
}

// ============================================================
// ENTRYPOINT
// ============================================================
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

async function main() {
  const args    = process.argv.slice(2).map((a) => a.toUpperCase());
  const targets = args.length > 0
    ? LEVELS.filter((l) => args.includes(l))
    : LEVELS;

  if (targets.length === 0) {
    console.error('No valid levels. Use: node seedGrammarLessons.js n5 n4 ...');
    process.exit(1);
  }

  console.log('\n=== Grammar Lessons Seed ===');
  console.log(`Levels: ${targets.join(', ')}\n`);

  let total = 0;
  for (const level of targets) {
    total += await seedLevel(level);
  }

  console.log(`\n=== Seed complete — ${total} lessons total ===\n`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
