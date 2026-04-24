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
// CONSTANTS
// ============================================================
const TRANSLATE_BATCH = 30; // คำต่อ Claude request
const DB_BATCH        = 50; // rows ต่อ Supabase upsert

// JLPT Vocab API — level param: 5=N5, 4=N4, 3=N3, 2=N2, 1=N1
// Format: [{ word, furigana, meaning, romaji, level }]
const API_URL = (level) =>
  `https://jlpt-vocab-api.vercel.app/api/words/all?level=${level}`;

// ============================================================
// FETCH LEVEL — ดึง vocab สำหรับ 1 ระดับจาก API
// ============================================================
async function fetchLevel(numericLevel) {
  const url = API_URL(numericLevel);
  console.log(`  Fetching from ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Unexpected response format');
  return data; // [{ word, furigana, meaning, romaji, level }]
}

// ============================================================
// TRANSLATE BATCH — ใช้ Claude Haiku แปลความหมายเป็นไทย
// ============================================================
async function translateBatch(entries) {
  const lines = entries
    .map((e, i) => `${i + 1}. ${e.word} (${e.furigana}): ${e.meaning}`)
    .join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content:
          'แปลความหมายคำศัพท์ภาษาญี่ปุ่นต่อไปนี้เป็นภาษาไทยให้กระชับ (1–5 คำ)\n' +
          'ตอบเฉพาะความหมายภาษาไทย แต่ละบรรทัดขึ้นต้นด้วยหมายเลขเหมือนต้นฉบับ\n\n' +
          lines,
      },
    ],
  });

  const raw = message.content[0].text.trim().split('\n');
  return entries.map((entry, i) => {
    const line    = raw[i] || '';
    const meaning = line.replace(/^\d+[.)]\s*/, '').trim() || entry.meaning;
    return { ...entry, thaiMeaning: meaning };
  });
}

// ============================================================
// SEED LEVEL — ดึง, แปล, และ upsert ลง DB สำหรับ 1 ระดับ
// ============================================================
async function seedLevel(levelName, numericLevel) {
  console.log(`\n[${levelName}] Starting...`);

  // --- ดึงข้อมูล ---
  const entries = await fetchLevel(numericLevel);
  console.log(`  [${levelName}] ${entries.length} entries fetched`);

  if (entries.length === 0) {
    console.log(`  [${levelName}] No entries — skipping`);
    return 0;
  }

  // --- แปลเป็นไทย เป็น batch ---
  const translated = [];
  for (let i = 0; i < entries.length; i += TRANSLATE_BATCH) {
    const batch = entries.slice(i, i + TRANSLATE_BATCH);
    process.stdout.write(
      `  [${levelName}] Translating ${i + 1}–${i + batch.length}/${entries.length}...`
    );
    const result = await translateBatch(batch);
    translated.push(...result);
    process.stdout.write(' done\n');
  }

  // --- upsert ลง Supabase ---
  const rows = translated.map((e) => ({
    word:           e.word,
    reading:        e.furigana,
    meaning:        e.thaiMeaning,
    part_of_speech: null,
    jlpt_level:     levelName, // 'N5', 'N4', ...
  }));

  let upserted = 0;
  for (let i = 0; i < rows.length; i += DB_BATCH) {
    const batch = rows.slice(i, i + DB_BATCH);
    const { error } = await supabase
      .from('jlpt_vocab')
      .upsert(batch, { onConflict: 'word,jlpt_level', ignoreDuplicates: false });
    if (error) throw new Error(`[${levelName}] DB upsert failed: ${error.message}`);
    upserted += batch.length;
  }

  console.log(`  [${levelName}] ${upserted} entries upserted to jlpt_vocab ✓`);
  return upserted;
}

// ============================================================
// ENTRYPOINT
// ============================================================
// Map level name → numeric level for the API
const LEVELS = [
  { name: 'N5', num: 5 },
  { name: 'N4', num: 4 },
  { name: 'N3', num: 3 },
  { name: 'N2', num: 2 },
  { name: 'N1', num: 1 },
];

async function main() {
  // รับ argument เช่น `node seedJlptVocabFull.js n5 n4` หรือรันทุกระดับ
  const args    = process.argv.slice(2).map((a) => a.toUpperCase());
  const targets = args.length > 0
    ? LEVELS.filter((l) => args.includes(l.name))
    : LEVELS;

  if (targets.length === 0) {
    console.error('No valid levels specified. Use: n5 n4 n3 n2 n1');
    process.exit(1);
  }

  console.log('\n=== JLPT Vocab Seed ===');
  console.log(`Levels: ${targets.map((l) => l.name).join(', ')}\n`);

  let total = 0;
  for (const level of targets) {
    total += await seedLevel(level.name, level.num);
  }

  console.log(`\n=== Seed complete — ${total} total entries ===\n`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
