// ============================================================
// IMPORTS
// ============================================================
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

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
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const TRANSLATE_BATCH = 30; // คำต่อ Claude request
const DB_BATCH = 50;        // rows ต่อ Supabase upsert

// แหล่งข้อมูล JLPT vocab (jbrooksuk/JLPT-Vocabulary format)
// format: [{ kana, kanji, english: [string, ...] }]
const DATA_URL = (level) =>
  `https://raw.githubusercontent.com/jbrooksuk/JLPT-Vocabulary/master/jlpt_${level}.json`;

// ============================================================
// FETCH JLPT DATA — ดึงจาก GitHub
// ============================================================
async function fetchLevel(level) {
  const url = DATA_URL(level);
  console.log(`  Fetching ${level.toUpperCase()} from ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected format for ${level}`);
  return data;
}

// ============================================================
// NORMALIZE — แปลง entry → { word, reading, englishMeaning }
// ============================================================
function normalizeEntry(entry) {
  // format: { kana, kanji?, english: string[] }
  const word = entry.kanji || entry.kana;
  const reading = entry.kana;
  const englishMeaning = Array.isArray(entry.english)
    ? entry.english.slice(0, 3).join(', ')
    : String(entry.english || '');
  return { word, reading, englishMeaning };
}

// ============================================================
// TRANSLATE BATCH — ใช้ Claude Haiku แปลความหมายเป็นไทย
// ============================================================
async function translateBatch(entries) {
  const lines = entries
    .map((e, i) => `${i + 1}. ${e.word} (${e.reading}): ${e.englishMeaning}`)
    .join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `แปลความหมายคำศัพท์ภาษาญี่ปุ่นต่อไปนี้เป็นภาษาไทยให้กระชับ (1-5 คำ)\nตอบเฉพาะความหมายภาษาไทย แต่ละบรรทัดขึ้นต้นด้วยหมายเลขเหมือนต้นฉบับ\n\n${lines}`,
      },
    ],
  });

  const raw = message.content[0].text.trim().split('\n');
  return entries.map((entry, i) => {
    const line = raw[i] || '';
    // ตัด "1. " หรือ "1)" prefix ออก
    const meaning = line.replace(/^\d+[.)]\s*/, '').trim() || entry.englishMeaning;
    return { ...entry, meaning };
  });
}

// ============================================================
// SEED LEVEL — ดึง, แปล, และ upsert ลง DB สำหรับ 1 ระดับ
// ============================================================
async function seedLevel(level) {
  const upperLevel = level.toUpperCase(); // 'N5'
  console.log(`\n[${upperLevel}] Starting...`);

  // --- ดึงข้อมูล ---
  const raw = await fetchLevel(level);
  const normalized = raw.map(normalizeEntry).filter((e) => e.word && e.reading);
  console.log(`  [${upperLevel}] ${normalized.length} entries fetched`);

  // --- แปลเป็นไทย เป็น batch ---
  const translated = [];
  for (let i = 0; i < normalized.length; i += TRANSLATE_BATCH) {
    const batch = normalized.slice(i, i + TRANSLATE_BATCH);
    process.stdout.write(`  [${upperLevel}] Translating ${i + 1}–${i + batch.length}/${normalized.length}...`);
    const result = await translateBatch(batch);
    translated.push(...result);
    process.stdout.write(' done\n');
  }

  // --- upsert ลง Supabase ---
  const rows = translated.map((e) => ({
    word: e.word,
    reading: e.reading,
    meaning: e.meaning,
    part_of_speech: null, // JMdict format ไม่ได้แยก POS แบบง่าย
    jlpt_level: upperLevel,
  }));

  let upserted = 0;
  for (let i = 0; i < rows.length; i += DB_BATCH) {
    const batch = rows.slice(i, i + DB_BATCH);
    const { error } = await supabase
      .from('jlpt_vocab')
      .upsert(batch, { onConflict: 'word,jlpt_level', ignoreDuplicates: false });
    if (error) throw new Error(`[${upperLevel}] DB upsert failed: ${error.message}`);
    upserted += batch.length;
  }

  console.log(`  [${upperLevel}] ${upserted} entries upserted to jlpt_vocab ✓`);
  return upserted;
}

// ============================================================
// ENTRYPOINT
// ============================================================
async function main() {
  // รับ argument เช่น `node seedJlptVocabFull.js n5 n4` หรือรันทุกระดับ
  const args = process.argv.slice(2).map((a) => a.toLowerCase());
  const targets = args.length > 0 ? args : LEVELS;

  console.log(`\n=== JLPT Vocab Full Seed ===`);
  console.log(`Levels: ${targets.map((l) => l.toUpperCase()).join(', ')}\n`);

  let total = 0;
  for (const level of targets) {
    if (!LEVELS.includes(level)) {
      console.warn(`Unknown level: ${level}, skipping`);
      continue;
    }
    total += await seedLevel(level);
  }

  console.log(`\n=== Seed complete — ${total} total entries ===\n`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
