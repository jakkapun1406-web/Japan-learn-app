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
