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
// CONSTANTS — lesson groups per type
// ============================================================
const LESSON_TOPICS = {
  hiragana: [
    { title: 'あ行 — a, i, u, e, o', sort_order: 1 },
    { title: 'か行 — ka, ki, ku, ke, ko', sort_order: 2 },
    { title: 'さ行 — sa, shi, su, se, so', sort_order: 3 },
    { title: 'た行 — ta, chi, tsu, te, to', sort_order: 4 },
    { title: 'な行 — na, ni, nu, ne, no', sort_order: 5 },
    { title: 'は行 — ha, hi, fu, he, ho', sort_order: 6 },
    { title: 'ま行 — ma, mi, mu, me, mo', sort_order: 7 },
    { title: 'や行 — ya, yu, yo', sort_order: 8 },
    { title: 'ら行 — ra, ri, ru, re, ro', sort_order: 9 },
    { title: 'わ行・ん — wa, wo, n', sort_order: 10 },
  ],
  katakana: [
    { title: 'ア行 — a, i, u, e, o', sort_order: 1 },
    { title: 'カ行 — ka, ki, ku, ke, ko', sort_order: 2 },
    { title: 'サ行 — sa, shi, su, se, so', sort_order: 3 },
    { title: 'タ行 — ta, chi, tsu, te, to', sort_order: 4 },
    { title: 'ナ行 — na, ni, nu, ne, no', sort_order: 5 },
    { title: 'ハ行 — ha, hi, fu, he, ho', sort_order: 6 },
    { title: 'マ行 — ma, mi, mu, me, mo', sort_order: 7 },
    { title: 'ヤ行 — ya, yu, yo', sort_order: 8 },
    { title: 'ラ行 — ra, ri, ru, re, ro', sort_order: 9 },
    { title: 'ワ行・ン — wa, wo, n', sort_order: 10 },
  ],
  'kanji-n5': [
    { title: '数字の漢字 — Numbers', sort_order: 1 },
    { title: '時間の漢字 — Time & Days', sort_order: 2 },
    { title: '自然の漢字 — Nature', sort_order: 3 },
    { title: '体・人の漢字 — Body & People', sort_order: 4 },
    { title: '動作の漢字 — Common Verbs', sort_order: 5 },
  ],
  'kanji-n4': [],
  'kanji-n3': [],
  'kanji-n2': [],
  'kanji-n1': [],
};

// ============================================================
// GENERATE LESSON — ใช้ Claude Haiku สร้างเนื้อหา 1 บทเรียน
// ============================================================
async function generateLesson(lessonType, jlptLevel, title) {
  const typeLabel =
    lessonType === 'hiragana' ? 'ฮิระงะนะ' :
    lessonType === 'katakana' ? 'คาตะกะนะ' :
    `คันจิระดับ ${jlptLevel}`;

  const isKana = lessonType === 'hiragana' || lessonType === 'katakana';

  const kanaCharNote = isKana
    ? `- characters: อักษรทุกตัวในแถวนี้ (${lessonType === 'hiragana' ? 'ฮิระงะนะ' : 'คาตะกะนะ'})`
    : `- characters: คันจิที่สำคัญในหมวดนี้ 5 ตัว พร้อม on'yomi และ kun'yomi`;

  const charShape = isKana
    ? `{ "char": "อักษร", "romaji": "การถอดเสียง", "stroke_order_hint": "คำแนะนำสั้นๆ เช่น เริ่มจากซ้ายบน", "examples": [{"word": "คำ", "reading": "การอ่าน", "meaning_thai": "ความหมาย"}] }`
    : `{ "char": "漢字", "romaji": "คุนโยมิ (kun'yomi)", "stroke_order_hint": "ความหมายหลักภาษาไทย", "examples": [{"word": "คำประสม", "reading": "การอ่าน", "meaning_thai": "ความหมาย"}] }`;

  const prompt = `สร้างบทเรียนการอ่าน${typeLabel}สำหรับผู้เรียนชาวไทย

หัวข้อ: ${title}${jlptLevel ? `\nระดับ JLPT: ${jlptLevel}` : ''}

ตอบเป็น JSON เท่านั้น (ไม่มีข้อความอื่น):
{
  "explanation": "คำอธิบายภาษาไทย 3-5 ประโยค อธิบายวิธีอ่าน เสียง และจุดที่ต้องระวัง",
  "characters": [
    ${charShape}
  ],
  "quiz": [
    {
      "question": "คำถามภาษาไทย",
      "options": ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
      "answer_index": 0
    }
  ]
}

กฎ:
- explanation: ภาษาไทย อธิบายให้ชัดเจน
${kanaCharNote}
- characters: ${isKana ? 'ทุกตัวในแถว' : '5 ตัว'} แต่ละตัวมี examples 2 คำเท่านั้น
- quiz: 5 ข้อ หลากหลาย (จับคู่อักษร / เลือกการอ่าน / เลือกความหมาย) answer_index คือ index 0-3`;

  // kanji lessons have more content (5 chars × 2 examples + quiz) so need more tokens
  const maxTokens = isKana ? 2048 : 4096;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found for: ${title}`);

  return JSON.parse(jsonMatch[0]);
}

// ============================================================
// SEED GROUP — สร้างบทเรียนทั้งหมดสำหรับ 1 group
// ============================================================
async function seedGroup(groupKey) {
  const topics = LESSON_TOPICS[groupKey];

  if (!topics || topics.length === 0) {
    console.log(`\n[${groupKey}] No topics defined — skipping.`);
    return 0;
  }

  // Parse lessonType + jlptLevel from groupKey
  let lessonType, jlptLevel;
  if (groupKey === 'hiragana' || groupKey === 'katakana') {
    lessonType = groupKey;
    jlptLevel  = null;
  } else {
    // e.g. 'kanji-n5' → lessonType='kanji', jlptLevel='N5'
    lessonType = 'kanji';
    jlptLevel  = groupKey.split('-')[1].toUpperCase();
  }

  console.log(`\n[${groupKey}] Generating ${topics.length} lessons...`);

  const rows = [];

  for (const topic of topics) {
    process.stdout.write(`  [${groupKey}] "${topic.title}"... `);

    try {
      const content = await generateLesson(lessonType, jlptLevel, topic.title);

      rows.push({
        lesson_type: lessonType,
        jlpt_level:  jlptLevel,
        title:       topic.title,
        explanation: content.explanation,
        characters:  content.characters,
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

  if (rows.length > 0) {
    const { error } = await supabase
      .from('reading_lessons')
      .upsert(rows, { onConflict: 'lesson_type,title', ignoreDuplicates: false });

    if (error) throw new Error(`[${groupKey}] DB upsert failed: ${error.message}`);
  }

  console.log(`  [${groupKey}] ${rows.length}/${topics.length} lessons upserted ✓`);
  return rows.length;
}

// ============================================================
// ENTRYPOINT
// ============================================================
const VALID_GROUPS = ['hiragana', 'katakana', 'kanji-n5', 'kanji-n4', 'kanji-n3', 'kanji-n2', 'kanji-n1'];

async function main() {
  const args    = process.argv.slice(2).map((a) => a.toLowerCase());
  const targets = args.length > 0
    ? VALID_GROUPS.filter((g) => args.includes(g))
    : VALID_GROUPS;

  if (targets.length === 0) {
    console.error('No valid groups. Use: node seedReadingLessons.js hiragana katakana kanji-n5');
    process.exit(1);
  }

  console.log('\n=== Reading Lessons Seed ===');
  console.log(`Groups: ${targets.join(', ')}\n`);

  let total = 0;
  for (const group of targets) {
    total += await seedGroup(group);
  }

  console.log(`\n=== Seed complete — ${total} lessons total ===\n`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
