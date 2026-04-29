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
const GENERATE_BATCH = 50; // คำต่อ Claude request
const DB_BATCH       = 50; // rows ต่อ Supabase upsert

const TARGETS = {
  N5: 800,
  N4: 1500,
  N3: 3750,
  N2: 6000,
  N1: 10000,
};

// ============================================================
// GET EXISTING WORDS — ดึงคำที่มีอยู่แล้วใน DB สำหรับระดับนั้น
// ============================================================
async function getExistingWords(levelName) {
  const { data, error } = await supabase
    .from('jlpt_vocab')
    .select('word')
    .eq('jlpt_level', levelName);
  if (error) throw new Error(`getExistingWords failed: ${error.message}`);
  return new Set(data.map((r) => r.word));
}

// ============================================================
// GENERATE BATCH — ใช้ Claude Haiku สร้างคำศัพท์ที่ขาดอยู่
// ============================================================
async function generateBatch(levelName, count, seenWords) {
  const avoidList = [...seenWords].join('、');

  const prompt =
    `คุณเป็นผู้เชี่ยวชาญภาษาญี่ปุ่น JLPT\n` +
    `สร้างคำศัพท์มาตรฐาน JLPT ${levelName} จำนวน ${count} คำ\n` +
    `ห้ามซ้ำกับรายการต่อไปนี้: ${avoidList}\n\n` +
    `ตอบเป็น JSON array เท่านั้น ไม่มีข้อความอื่นนอกจาก JSON:\n` +
    `[{"word":"日本語","reading":"にほんご","meaning":"ภาษาญี่ปุ่น"}]\n` +
    `- word: คำภาษาญี่ปุ่น (คันจิหรือคะนะ)\n` +
    `- reading: การอ่านในฮิระงะนะ\n` +
    `- meaning: ความหมายภาษาไทย กระชับ 1–5 คำ`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();

  // ---- strip markdown code fences if present ----
  const jsonStr = raw
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // fallback: extract first [...] block
    const match = jsonStr.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in Claude response');
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed)) throw new Error('Claude response is not an array');

  // ---- filter: valid fields + not already seen ----
  return parsed.filter(
    (e) =>
      e &&
      typeof e.word    === 'string' && e.word.trim() &&
      typeof e.reading === 'string' && e.reading.trim() &&
      typeof e.meaning === 'string' && e.meaning.trim() &&
      !seenWords.has(e.word.trim())
  );
}

// ============================================================
// SEED EXTRA — generate + upsert คำที่ขาดสำหรับ 1 ระดับ
// ============================================================
async function seedExtra(levelName) {
  const target = TARGETS[levelName];
  if (!target) throw new Error(`No target defined for level ${levelName}`);

  console.log(`\n[${levelName}] Fetching existing words from DB...`);
  const seen = await getExistingWords(levelName);
  const currentCount = seen.size;
  const needed = target - currentCount;

  console.log(`  Current: ${currentCount} | Target: ${target} | Need: ${needed > 0 ? needed : 0}`);

  if (needed <= 0) {
    console.log(`  Already at or above target — skipping`);
    return 0;
  }

  const generated = [];
  let remaining = needed;
  let batchNum = 0;
  let emptyStreak = 0;

  while (remaining > 0) {
    batchNum++;
    const batchSize = Math.min(GENERATE_BATCH, remaining + 10); // +10 buffer for duplicates
    process.stdout.write(
      `  [${levelName}] Batch ${batchNum} — generating ${batchSize} words...`
    );

    try {
      const batch = await generateBatch(levelName, batchSize, seen);
      if (batch.length === 0) {
        process.stdout.write(' 0 new (all duplicates)\n');
        emptyStreak++;
        if (emptyStreak >= 3) {
          console.warn(`  [${levelName}] 3 consecutive empty batches — stopping`);
          break;
        }
        continue;
      }

      emptyStreak = 0;
      batch.forEach((e) => seen.add(e.word.trim()));
      generated.push(...batch);
      remaining -= batch.length;
      process.stdout.write(` got ${batch.length} (remaining: ${Math.max(0, remaining)})\n`);
    } catch (err) {
      console.error(`\n  [${levelName}] Batch error: ${err.message}`);
      break;
    }
  }

  if (generated.length === 0) {
    console.log(`  [${levelName}] No new words generated`);
    return 0;
  }

  // ---- upsert ลง Supabase ----
  const rows = generated.map((e) => ({
    word:           e.word.trim(),
    reading:        e.reading.trim(),
    meaning:        e.meaning.trim(),
    part_of_speech: null,
    jlpt_level:     levelName,
  }));

  let upserted = 0;
  for (let i = 0; i < rows.length; i += DB_BATCH) {
    const batch = rows.slice(i, i + DB_BATCH);
    const { error } = await supabase
      .from('jlpt_vocab')
      .upsert(batch, { onConflict: 'word,jlpt_level', ignoreDuplicates: true });
    if (error) throw new Error(`[${levelName}] DB upsert failed: ${error.message}`);
    upserted += batch.length;
  }

  console.log(`  [${levelName}] ${upserted} entries upserted to jlpt_vocab ✓`);
  return upserted;
}

// ============================================================
// ENTRYPOINT
// ============================================================
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

async function main() {
  const args    = process.argv.slice(2).map((a) => a.toUpperCase());
  const targets = args.length > 0
    ? args.filter((a) => VALID_LEVELS.includes(a))
    : VALID_LEVELS;

  if (targets.length === 0) {
    console.error('No valid levels. Use: node seedJlptVocabExtra.js n5 n4');
    process.exit(1);
  }

  console.log('\n=== JLPT Vocab Extra Seed ===');
  console.log(`Levels: ${targets.join(', ')}\n`);

  let total = 0;
  for (const level of targets) {
    total += await seedExtra(level);
  }

  console.log(`\n=== Done — ${total} total new entries ===\n`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
