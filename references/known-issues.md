# Known Issues — Japanese App

> อ่านไฟล์นี้ก่อน debug ทุกครั้ง

<!-- เพิ่ม bug entries ที่นี่เมื่อพบและแก้ไขแล้ว -->

---

## [BUG-001] client/.env ใช้ service_role key แทน anon key

**วันที่พบ:** 2026-04-23  
**ความรุนแรง:** Critical (Security)

**อาการ:** `VITE_SUPABASE_ANON_KEY` ใน `client/.env` มีค่าเป็น service_role JWT (`"role":"service_role"`) แทนที่จะเป็น anon JWT (`"role":"anon"`)

**ผลกระทบ:** service_role key bypass RLS policies ทั้งหมดใน Supabase — ถ้า key หลุดออกไปจาก browser จะอ่าน/เขียนข้อมูลได้ทุกอย่างโดยไม่มีข้อจำกัด

**สาเหตุ:** copy key ผิดตัวตอนตั้งค่า .env

**วิธีแก้:** เปลี่ยน `VITE_SUPABASE_ANON_KEY` ให้ใช้ค่า anon key (ดูได้จาก `server/.env` ใน field `SUPABASE_ANON_KEY`)

**Status:** Fixed ✓

---

## [BUG-002] แก้ไขคำศัพท์แสดง raw Postgres error เมื่อ word ซ้ำใน deck

**วันที่พบ:** 2026-05-02  
**ความรุนแรง:** Medium (UX)

**อาการ:** เมื่อแก้ไข vocab card โดยเปลี่ยน `word` เป็นคำที่มีอยู่ใน deck เดิมแล้ว modal แสดง `duplicate key value violates unique constraint "vocab_cards_word_deck_unique"` แทนที่จะเป็น message ภาษาไทยที่เข้าใจง่าย

**สาเหตุ:** `updateVocabCard` ใน `vocab.controller.js` ไม่มีการตรวจสอบ duplicate ก่อน `.update()` — Supabase ส่ง raw PostgreSQL error (code 23505) กลับมาและ controller throw ต่อไปยัง client โดยตรง

**วิธีแก้:**  
- เพิ่ม pre-check query ใน `updateVocabCard`: query `vocab_cards` หา card ที่มี `word` เดียวกัน + `deck_id` เดียวกัน แต่ `id` ต่างกัน — ถ้าเจอ return `409` พร้อม message `"คำนี้มีอยู่ใน deck นี้แล้ว"`  
- เพิ่ม `err.code === '23505'` catch ใน `addVocabCard` เผื่อกรณีเดียวกันเกิดที่ add

**Status:** Fixed ✓

---

## [BUG-003] masteredCount ใน ReviewPage แสดงค่า 0 เสมอ

**วันที่พบ:** 2026-05-02  
**ความรุนแรง:** Medium (UX — แถบ progress เชี่ยวชาญแสดงผิด)

**อาการ:** แถบ "เชี่ยวชาญ X/Y" ใน ReviewPage lobby แสดง 0 เสมอ ไม่ว่าจะรีวิวการ์ดไปมากแค่ไหน

**สาเหตุ:** `masteredCount` ใช้ `c.repetitions` ซึ่งเป็น field ระดับบนสุดของ card object แต่ `vocab_cards` table ไม่มี column `repetitions` — ค่านี้อยู่ใน `review_logs` และถูก map มาเป็น `c.review_log.repetitions` โดย `getDueCards` controller

**วิธีแก้:**  
- `ReviewPage.jsx` line 100: เปลี่ยน `c.repetitions` → `c.review_log?.repetitions`  
- ปรับ threshold จาก `>= 2` → `>= 3` (rep=3 ≈ interval ~27 วัน = เชี่ยวชาญจริง)

**Status:** Fixed ✓
