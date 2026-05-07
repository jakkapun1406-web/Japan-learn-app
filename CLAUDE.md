# CLAUDE.md — Japanese Language Learning App

## Project Overview

A full-stack Japanese language learning app with spaced-repetition flashcards, grammar lessons, kana/kanji reading, and listening/speaking practice.

---

## Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19 + Vite 8 (`client/`)           |
| Backend  | Node.js + Express 5 (`server/`)         |
| Database | Supabase (PostgreSQL + Auth)            |
| AI       | Anthropic Claude SDK (`@anthropic-ai/sdk`) |
| Hosting  | Vercel (frontend) + Render (backend)    |

---

## Monorepo Layout

```
japanese-app/
├── client/                    # React + Vite frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── vercel.json            # Vercel deploy config (SPA rewrite rule)
│   └── src/
│       ├── assets/            # Static images (hero.png, etc.)
│       ├── components/
│       │   ├── Deck/          # DeckCard.jsx, CreateDeckModal.jsx
│       │   ├── Flashcard/     # ReviewCard.jsx, ReviewResult.jsx, DailyQuizCard.jsx
│       │   ├── Grammar/       # GrammarExplainModal.jsx
│       │   └── Vocabulary/    # VocabCard.jsx, AddVocabModal.jsx, EditVocabModal.jsx
│       ├── constants/
│       │   └── jlptLevels.js  # N5–N1 level definitions + JLPT_COLORS
│       ├── hooks/
│       │   ├── useAuth.js             # Supabase session hook
│       │   ├── useSpeechRecognition.js # Web Speech API, lang=ja-JP, maxAlternatives=3
│       │   └── useTextToSpeech.js     # SpeechSynthesis TTS, ja-JP voice
│       ├── lib/
│       │   └── supabaseClient.js  # Supabase browser client
│       ├── pages/
│       │   ├── DashboardPage.jsx      # JLPT + user deck sections + สถิติ nav button
│       │   ├── DeckPage.jsx           # Deck detail view — JLPT level tab bar (N5–N1) + deck list
│       │   ├── VocabPage.jsx          # Vocab list for a deck
│       │   ├── ReviewPage.jsx         # SRS flashcard review
│       │   ├── GrammarPage.jsx        # Lesson browser — tabs N5–N1 + lesson cards
│       │   ├── GrammarLessonPage.jsx  # Lesson detail + examples + mini-quiz + AI explain
│       │   ├── ProgressPage.jsx       # แผนการเรียนประจำวัน — daily checklist per JLPT level
│       │   ├── ProfilePage.jsx        # โปรไฟล์ผู้ใช้ — avatar, preferred level, stats, logout
│       │   ├── ReadingPage.jsx        # Kana/Kanji reading module — lesson selector
│       │   ├── ReadingLessonPage.jsx  # Reading lesson + character quiz
│       │   ├── SpeakingPage.jsx       # Speaking practice — level + word count setup
│       │   ├── SpeakingSessionPage.jsx # Speaking session — mic + TTS + match result
│       │   ├── DailyQuizPage.jsx      # Daily quiz lobby — level selector + status ring
│       │   ├── DailyQuizSessionPage.jsx # Daily quiz session — flip cards + รู้/ไม่รู้
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── services/
│       │   ├── apiClient.js       # Axios instance
│       │   ├── aiService.js       # getGrammarExplain (Claude Haiku)
│       │   ├── deckService.js     # getDecks, createDeck, deleteDeck, initJlptDecks
│       │   ├── vocabService.js    # getVocabByDeck, addVocabCard, updateVocabCard, deleteVocabCard
│       │   ├── reviewService.js   # getReviewCards, submitReview
│       │   ├── grammarService.js  # getLessons, getLessonById
│       │   ├── progressService.js # getProgressStats
│       │   ├── readingService.js  # getKanaLessons, getKanjiLessons, getLessonById
│       │   ├── speakingService.js # getWordsForLevel
│       │   └── dailyQuizService.js # getDailyQuizWords, submitDailyQuizAnswer, getDailyQuizStatus
│       ├── utils/
│       │   └── srsAlgorithm.js    # SM-2 / SRS scheduling logic
│       ├── App.jsx
│       └── main.jsx
│
├── server/                    # Express API backend
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── ai.controller.js         # getGrammarExplain (claude-haiku-4-5)
│   │   ├── deck.controller.js
│   │   ├── vocab.controller.js
│   │   ├── review.controller.js
│   │   ├── jlptVocab.controller.js
│   │   ├── jlptDeck.controller.js   # initJlptDecks — auto-create N5–N1 decks
│   │   ├── grammar.controller.js    # getLessons, getLessonById
│   │   ├── progress.controller.js   # getProgressStats — aggregates review_logs + vocab_cards; includes totalStudyDays
│   │   ├── reading.controller.js    # getKanaLessons, getKanjiLessons, getLessonById
│   │   ├── speaking.controller.js   # getWordsForLevel (shuffle + limit)
│   │   └── dailyQuiz.controller.js  # getWords, submitAnswer, getStatus (uses vocab_cards)
│   ├── lib/
│   │   └── supabaseClient.js  # Supabase server-side client
│   ├── middleware/
│   │   └── auth.middleware.js # JWT / session verification
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── ai.routes.js             # POST /api/ai/grammar-explain
│   │   ├── deck.routes.js
│   │   ├── vocab.routes.js
│   │   ├── review.routes.js
│   │   ├── jlptVocab.routes.js
│   │   ├── jlptDeck.routes.js       # POST /api/jlpt-decks/init
│   │   ├── grammar.routes.js        # GET /api/grammar/:level, /api/grammar/lesson/:id
│   │   ├── progress.routes.js       # GET /api/progress/stats
│   │   ├── reading.routes.js        # GET /api/reading/kana/:type, /kanji/:level, /lesson/:id
│   │   ├── speaking.routes.js       # GET /api/speaking/words/:level
│   │   └── dailyQuiz.routes.js      # GET /api/daily-quiz/words|status, POST /api/daily-quiz/answer
│   ├── scripts/
│   │   ├── 001_create_jlpt_vocab.sql       # Creates jlpt_vocab table
│   │   ├── 002_vocab_cards_unique_word.sql  # Unique(word, deck_id) constraint
│   │   ├── 003_add_deck_type.sql            # Adds deck_type col to user_decks
│   │   ├── 004_grammar_lessons.sql          # Creates grammar_lessons table
│   │   ├── 005_reading_lessons.sql          # Creates reading_lessons table
│   │   ├── 006_daily_quiz_logs.sql          # Creates daily_quiz_logs table (phase 13)
│   │   ├── seedJlptVocab.js                 # Old seed (150 words, deprecated)
│   │   ├── seedJlptVocabFull.js             # Full seed via JMdict → Claude Haiku
│   │   ├── seedGrammarLessons.js            # AI seed: 5 lessons × 5 levels via Claude Haiku
│   │   └── seedReadingLessons.js            # Seeds hiragana/katakana/kanji-N5 lessons
│   ├── render.yaml            # Render deploy config (Node web service)
│   └── index.js               # Entry point — port 3001
│
├── references/
│   └── known-issues.md        # Bug log — READ BEFORE DEBUGGING
│
├── .env.example               # Root env template (keys only, incl. FRONTEND_URL)
├── .gitignore
└── CLAUDE.md                  # This file
```

---

## Dev Commands

### Client (runs on http://localhost:5173)
```bash
cd client
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

### Server (runs on http://localhost:3001)
```bash
cd server
npm run dev        # nodemon watch mode
npm run start      # Production start
```

### Health Check
```
GET http://localhost:3001/api/health
```

---

## Environment Variables

### `server/.env`
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### `client/.env`
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001
```

> Never commit `.env` files. Copy from `.env.example` and fill in values.

---

## API Routes

| Method | Path                              | Auth | Description                        |
|--------|-----------------------------------|------|------------------------------------|
| GET    | `/`                               | No   | Root — `{ status: "ok", message: "Server is running" }` |
| GET    | `/api/health`                     | No   | Server health check                |
| POST   | `/api/auth/register`              | No   | สมัครสมาชิก                        |
| POST   | `/api/auth/login`                 | No   | เข้าสู่ระบบ                        |
| POST   | `/api/auth/logout`                | No   | ออกจากระบบ                         |
| GET    | `/api/decks`                      | Yes  | ดึง deck ทั้งหมด (incl. deck_type) |
| POST   | `/api/decks`                      | Yes  | สร้าง user deck (deck_type='user') |
| DELETE | `/api/decks/:id`                  | Yes  | ลบ deck                            |
| PATCH  | `/api/decks/:id`                  | Yes  | เปลี่ยนชื่อ deck (user decks only) |
| GET    | `/api/decks/:deckId/vocab`        | Yes  | ดึงคำศัพท์ใน deck                  |
| POST   | `/api/decks/:deckId/vocab`        | Yes  | เพิ่มคำศัพท์ใน deck                |
| PUT    | `/api/decks/:deckId/vocab/:cardId`| Yes  | แก้ไขคำศัพท์                       |
| DELETE | `/api/decks/:deckId/vocab/:cardId`| Yes  | ลบคำศัพท์                         |
| GET    | `/api/decks/:deckId/review`       | Yes  | ดึงการ์ดที่ถึงเวลา review          |
| POST   | `/api/decks/:deckId/review`       | Yes  | ส่งผล review (grade 0–3)           |
| POST   | `/api/jlpt-decks/init`            | Yes  | Auto-create JLPT N5–N1 decks       |
| GET    | `/api/jlpt-vocab`                 | Yes  | ดึง vocab จากคลัง jlpt_vocab       |
| GET    | `/api/grammar/:level`             | Yes  | ดึงรายการบทเรียน (N5–N1)           |
| GET    | `/api/grammar/lesson/:id`         | Yes  | ดึงบทเรียน + examples + quiz       |
| GET    | `/api/speaking/words/:level`      | Yes  | ดึงคำศัพท์สำหรับฝึกพูด (shuffle + limit) |
| GET    | `/api/reading/kana/:type`         | Yes  | ดึงบทเรียน hiragana หรือ katakana         |
| GET    | `/api/reading/kanji/:level`       | Yes  | ดึงบทเรียนคันจิตาม JLPT level            |
| GET    | `/api/reading/lesson/:id`         | Yes  | ดึงบทเรียน + quiz characters              |
| GET    | `/api/progress/stats`             | Yes  | สถิติการเรียนรู้ (streak, mastery, byLevel) |
| POST   | `/api/ai/grammar-explain`         | Yes  | AI grammar deep-explanation + breakdown   |
| GET    | `/api/daily-quiz/words`           | Yes  | สุ่ม 50 คำ/วัน จาก vocab_cards ของ user (phase 13) |
| POST   | `/api/daily-quiz/answer`          | Yes  | บันทึกผลตอบ รู้/ไม่รู้ (phase 13)                  |
| GET    | `/api/daily-quiz/status`          | Yes  | สถิติ daily quiz วันนี้ (phase 13)                  |

CORS allows `http://localhost:5173` (dev) and `FRONTEND_URL` env var (production).

---

## Current Implementation Status

| Feature                         | Status       |
|---------------------------------|--------------|
| Auth (login/register)           | Done         |
| SRS algorithm (SM-2)            | Done         |
| JLPT level constants + colors   | Done         |
| Deck management (CRUD)          | Done         |
| JLPT decks (deck_type='jlpt')   | Done         |
| JLPT deck auto-init on login    | Done         |
| Vocabulary list (VocabPage)     | Done         |
| Flashcard review UI             | Done         |
| JLPT vocab seed (full JMdict)   | Done — 8,385 words across N5–N1 in `jlpt_vocab`    |
| Grammar lessons (module)        | Done — DB, API, UI, mini-quiz ✓                     |
| Grammar lessons (N5 seed)       | Done — 5 lessons seeded via Claude Haiku ✓          |
| Grammar lessons (N4–N1 seed)    | Pending — need Anthropic API credits to complete    |
| Kana / Kanji reading            | Done — hiragana/katakana/kanji-N5 lessons + quiz ✓  |
| Speaking practice               | Done — Web Speech API, match kanji+reading, NFKC normalize, TTS ✓ |
| User progress dashboard         | Done — `/progress` page: streak, mastery, byLevel bars ✓                    |
| AI grammar explanations         | Done — GrammarExplainModal: deeperExplanation, breakdown, mistakes ✓         |
| Vocab card edit                 | Done — EditVocabModal + PUT /api/decks/:deckId/vocab/:cardId ✓               |
| Deck rename                     | Done — DeckCard inline edit (✏️) + renameDeck service + PATCH /api/decks/:id ✓ |
| Listening practice              | Done — ListeningPage + ListeningSessionPage + listening controller + Web Speech TTS + 4-choice quiz ✓ |
| Daily Vocab Quiz (Phase 13)     | Done — DailyQuizPage + DailyQuizSessionPage + DailyQuizCard + daily_quiz_logs ✓ (pulls from vocab_cards) |
| Profile page (Phase 14)         | Done — ProfilePage: initials avatar, preferred_level (user_metadata), stats, logout ✓ |
| Vocab Search & Filter (Phase 18) | Done — VocabPage: search input + level chips (N5–N1) + POS chips; client-side filter via useMemo ✓ |
| Grammar lessons (N4–N1 seed)    | Pending — need Anthropic API credits to complete                             |

---

## Features Planned

- N4–N1 grammar lessons (pending Anthropic API credits)
- Streak calendar on ProgressPage (90-day GitHub-style activity grid)

---

## Dev Rules (MUST FOLLOW)

1. **Clarify before coding** — always ask if requirements are unclear before writing any code.
2. **Plan first** — produce a planning checklist covering folder structure, schema, components, and endpoints before implementation.
3. **Section comments** — organize every file with `// === SECTION ===` style headers (see format below).
4. **4-step debug process** — analyze → identify root cause → define log strategy → implement fix.
5. **Read `references/known-issues.md` before every debug session.**
6. **Auto-fix recurring bugs** — fix without asking, then append a new entry to `known-issues.md`.
7. **Never write code without section comments** explaining each block.
8. **Commit after every phase** — after testing is complete for each phase, commit all changes to git with a message describing the phase (e.g. `feat: phase 2 — backend API routes`).

### Operational Rules

9. **NO MAGIC — ห้ามเดา**
   - State all assumptions explicitly before acting.
   - If infra, file paths, or services are unknown, ask — do not invent them.
   - Never reference an API, service, or file that hasn't been confirmed to exist.
   - Format: "I'm assuming X. Is that correct?" before proceeding.

10. **VERIFY BEFORE DONE — ห้ามบอกว่าเสร็จถ้ายังไม่เช็ค**
    - Never say "done", "fixed", or "should work now" without running verification.
    - "I edited the file" is not done. "I edited the file and here's the output" is done.
    - Evidence before assertions — always show command output or observable proof.

11. **DISSENT — ต้องเถียงก่อน commit**
    - Before any major change, surface concerns:
      - What's the blast radius if this goes wrong?
      - What assumptions are we making?
      - What's the reversibility path?
      - What are we NOT seeing because of momentum?
    - A second opinion that pushes back is worth more than one that nods along.

12. **SCOPE DRIFT DETECTION — จับ scope creep**
    - Track stated goals vs actual execution at all times.
    - Flag immediately when:
      - "Just one more thing" accumulates beyond the original ask.
      - Nice-to-haves are being treated as must-haves.
      - The ask was "fix bug X" but execution has drifted to "refactor the entire module."
    - Do not expand scope without explicit approval.

13. **R0 / R1 / R2 — Reversibility tiers**
    - **R0 (irreversible)** — STOP. Ask before proceeding. Examples: deploy to production, drop a DB table, send external messages.
    - **R1 (costly to reverse)** — Proceed, but explain the action and reversibility path first. Examples: breaking API changes, major refactors, migration scripts.
    - **R2 (easily reversed)** — Just do it, no permission needed. Examples: UI color tweaks, adding a log line, editing a comment.

---

## Comment Style

Every file must use this section comment format:

```js
// ============================================================
// SECTION NAME
// ============================================================
```

Example sections: `IMPORTS`, `CONSTANTS`, `TYPES`, `STATE`, `HOOKS`, `HANDLERS`, `RENDER`, `MIDDLEWARE`, `ROUTES`, `EXPORTS`.

---

## Naming Conventions

| Target         | Convention   | Example                    |
|----------------|--------------|----------------------------|
| React components | PascalCase  | `FlashcardReview.jsx`      |
| Custom hooks   | useFeatureName | `useAuth.js`, `useDeck.js` |
| Functions      | camelCase    | `calculateNextReview()`    |
| DB tables      | snake_case   | `vocab_cards`, `user_decks`|
| API routes     | kebab-case   | `/api/flash-cards`         |
| Files (non-component) | camelCase | `srsAlgorithm.js`     |
| Constants      | UPPER_SNAKE_CASE | `JLPT_LEVELS`          |

---

## Module System

- **Client** — ES Modules (`"type": "module"` in package.json). Use `import/export`.
- **Server** — CommonJS (`"type": "commonjs"` in package.json). Use `require/module.exports`.

Do not mix module systems between client and server.

---

## Key Dependencies

### Client
| Package               | Purpose                        |
|-----------------------|--------------------------------|
| react / react-dom     | UI framework                   |
| react-router-dom v7   | Client-side routing            |
| @supabase/supabase-js | Supabase auth + DB client      |
| axios                 | HTTP requests to backend       |

### Server
| Package               | Purpose                                  |
|-----------------------|------------------------------------------|
| express v5            | HTTP server / routing                    |
| @supabase/supabase-js | Supabase server-side client              |
| @anthropic-ai/sdk     | Claude AI integration (Haiku for seed)   |
| cors                  | CORS middleware                          |
| dotenv                | Load `.env` variables                    |
| nodemon               | Dev auto-restart                         |
| adm-zip               | (removed — not needed after seed rewrite)|

---

## Deployment

| Layer    | Platform  | Config file              | Notes |
|----------|-----------|--------------------------|-------|
| Frontend | Vercel    | `client/vercel.json`     | SPA rewrite rule; auto-detects Vite |
| Backend  | Render    | `server/render.yaml`     | Node web service; `npm start` |
| Database | Supabase  | —                        | Already running |

### Deploy Steps (first time)
1. Push repo to GitHub.
2. **Render** — New Web Service → connect repo → set root to `server/` → add env vars.
3. **Vercel** — New Project → connect repo → set root to `client/` → add env vars.
4. Copy the Render URL into Vercel's `VITE_API_URL`.
5. Copy the Vercel URL into Render's `FRONTEND_URL`.

### Environment Variables
**Vercel (client):**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_API_URL` — Render backend URL

**Render (server):**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `ANTHROPIC_API_KEY` — Anthropic API key
- `FRONTEND_URL` — Vercel frontend URL (for CORS)

---

## References

- `references/known-issues.md` — all logged bugs and their fixes. Read before debugging.
- `.env.example` — template for environment variables (includes `FRONTEND_URL`).
- Supabase dashboard — database schema, auth settings, RLS policies.

---

## Current Progress

- [x] Project setup (React + Vite + Node.js + Supabase)
- [x] Auth (login / register / logout)
- [x] Supabase tables: `user_decks`, `vocab_cards`, `jlpt_vocab`, `review_logs`
- [x] SQL migrations: 001 (jlpt_vocab), 002 (unique word+deck), 003 (deck_type col)
- [x] Deck management: getDecks, createDeck, deleteDeck
- [x] JLPT deck separation: `deck_type` column, `initJlptDecks` endpoint
- [x] Dashboard: JLPT Decks section + ห้องเรียนของฉัน section (auto-init)
- [x] DeckCard: `isJlpt` prop, JLPT badge, no delete button for JLPT decks
- [x] VocabPage: view + add vocab (works for both deck types)
- [x] Flashcard review UI (ReviewPage + SRS)
- [x] Seed script fixed — uses `jlpt-vocab-api.vercel.app` (8,385 words total)
- [x] N5 seeded: 662 entries in `jlpt_vocab` ✓
- [x] N4 seeded: 632 entries in `jlpt_vocab` ✓
- [x] N3 seeded: 1,797 entries in `jlpt_vocab` ✓
- [x] N2 seeded: 1,831 entries in `jlpt_vocab` ✓
- [x] N1 seeded: 3,463 entries in `jlpt_vocab` ✓ (8,385 total)
- [x] Migration 003 run in Supabase SQL Editor ✓
- [x] Migration 004 run in Supabase SQL Editor ✓ (`grammar_lessons` table)
- [x] Grammar Lessons module — DB, API, frontend (GrammarPage + GrammarLessonPage + mini-quiz) ✓
- [x] N5 grammar lessons seeded — 5 lessons in DB ✓
- [ ] N4–N1 grammar lessons seeded — pending Anthropic API credits
- [ ] End-to-end test: login → Dashboard → ไวยากรณ์ → lessons → quiz works
- [x] Phase 8 — Reading Module: hiragana/katakana/kanji lessons + mini-quiz ✓
- [x] Phase 9 — Speaking Practice: SpeakingPage + SpeakingSessionPage + useSpeechRecognition + TTS ✓
- [x] Phase 9 bug fixes: NFKC normalize, stale-closure fix (useRef), kanji/reading dual match, show heard text ✓
- [x] Deployment prep — `client/vercel.json` + `server/render.yaml` + CORS FRONTEND_URL ✓
- [x] Deployed — Frontend: https://japan-learn-app-tbky.vercel.app · Backend: https://japan-learn-app.onrender.com ✓
- [x] Post-deploy fix — CORS blocked (FRONTEND_URL missing on Render) + frontend pointing to localhost (VITE_API_URL not set on Vercel) — both fixed ✓
- [x] Phase 10 — User Progress Dashboard: `/progress` page, `GET /api/progress/stats`, streak + mastery + byLevel aggregation from existing tables ✓
- [x] Phase 11 — AI Grammar Explanations: GrammarExplainModal (deeperExplanation/breakdown/commonMistakes) in GrammarLessonPage ✓ (AI vocab hint system removed)
- [x] Phase 12 — Vocab Card Edit: EditVocabModal + `PUT /api/decks/:deckId/vocab/:cardId` + ✏️ button in VocabCard ✓
- [x] Phase 13 — Daily Vocab Quiz: DailyQuizCard + DailyQuizPage + DailyQuizSessionPage + dailyQuiz controller/routes + `006_daily_quiz_logs.sql` ✓
- [ ] Migration 006 — run `006_daily_quiz_logs.sql` in Supabase SQL Editor (creates `daily_quiz_logs` table)
- [x] Phase 14 — Profile Page split: ProfilePage (`/profile`) + ProgressPage pure learning plan + totalStudyDays in progress stats + BottomNavBar profile path → `/profile` ✓
- [x] Phase 14 bug fix — `DailyQuizPage.jsx` used undefined `VALID_LEVELS` (server-only); replaced with `JLPT_LEVELS` from frontend constants ✓
- [x] Phase 15 v2 — Design polish (from Full Prototype.html v2):
  - `BottomNavBar.jsx`: tabs 2–4 updated — คำศัพท์→`/decks`, ทดสอบ→`/daily-quiz` (exact active), วันนี้→`/daily-quiz` (never active, quick-start shortcut)
  - `App.css`: `dash-slideIn` fixed to `translateX(100%)`; 9 new animation classes: `stat-pop`, `page-back`, `result-bounce`, `mic-idle`, `mic-listen`, `listen-playing`, `grade-btn-anim`, `kana-card`, `prog-fill-anim`; `.prof-jlpt-*` CSS added
  - `ListeningSessionPage.jsx`: gradient dark player card (linear-gradient #1f4a62→#2d6482), `playing` state with 2s timeout reset, `listen-playing` blink animation
  - `ProfilePage.jsx`: `AnimatedBar` component + `useCountUp` hook (RAF ease-out cubic) + `stat-pop` staggered entrance + JLPT progress bars section
- [x] DeckPage level tabs — `DeckPage.jsx`: N5–N1 tab bar at top, navigates to `/decks/:level` on click; `App.jsx`: added `/decks` → `/decks/N5` redirect; `BottomNavBar.jsx`: vocab tab path `/decks/N5` → `/decks` ✓
- [x] Phase 16 — ProgressPage + Review redesign (2026-05-02):
  - `BottomNavBar.jsx`: "วันนี้" tab path changed from `/daily-quiz` → `/progress`; isActive now highlights on `/progress`
  - `ProgressPage.jsx`: mobile-first redesign — header card (date + level + streak chip), vertical activity cards with left accent border, filled CTA buttons; `.lp-page` max-width + top padding to match other pages
  - `ReviewPage.jsx`: removed "รีวิวตามกำหนด" mode — lobby now shows stats card (total count + mastered progress bar) + single "เริ่มรีวิว" button; session has inline progress bar replacing header counter
  - `ReviewCard.jsx`: grade buttons simplified from 4 → 2 (ไม่รู้=grade 1 / รู้ ✓=grade 3)
  - `App.css`: replaced old `.lobby-*` CSS with new `.rv-*` system (lobby, session bar, 2-button grade row)
- [x] BUG-002 fix — vocab edit duplicate word shows raw Postgres error (2026-05-02):
  - `vocab.controller.js`: added pre-check query in `updateVocabCard` (`.neq('id', cardId)`) → returns `409` + Thai message `"คำนี้มีอยู่ใน deck นี้แล้ว"` instead of raw constraint error
  - `vocab.controller.js`: added `err.code === '23505'` catch in `addVocabCard` for same case
  - `references/known-issues.md`: logged as BUG-002 ✓
- [x] Deck rename — DeckCard inline edit (✏️ button) + `renameDeck` in deckService + PATCH `/api/decks/:id` + renameDeck controller ✓
- [x] Listening Practice — `ListeningPage.jsx` + `ListeningSessionPage.jsx` + `listening.controller.js` + `listening.routes.js` + `listeningService.js` + App.css `.ls-*` design system + Dashboard tile "ฟังเสียง" → `/listening` ✓
- [x] Code review fixes (2026-05-02) — 4 issues from post-Phase-16 review:
  - `deck.controller.js`: JLPT rename guard — pre-fetch `deck_type`, return 403 if `'jlpt'` ✓
  - `deck.controller.js`: `renameDeck` response shape fixed → `{ deck: data }` ✓
  - `vocab.controller.js`: `addVocabCard` pre-check before insert (consistent with `updateVocabCard`) ✓
  - `ReviewPage.jsx`: `masteredCount` path fixed `c.repetitions` → `c.review_log?.repetitions`; threshold `>= 2` → `>= 3` ✓

---

## Data Sources

| Source | URL | Notes |
|--------|-----|-------|
| JLPT Vocab API | `https://jlpt-vocab-api.vercel.app/api/words/all?level=5` | Confirmed working. level=5→N5, 4→N4, etc. |
| jmdict-simplified v3 | — | No JLPT tags in v3, not suitable |
| jbrooksuk/JLPT-Vocabulary | — | HTTP 404, repo gone |

---

## Last Working On

- Phase 18 — Vocab Search & Filter (2026-05-07) — complete ✓
  - `VocabPage.jsx`: `searchTerm` + `filterLevel` + `filterPOS` state; `filteredCards` via `useMemo`; search input + level chips (N5–N1/ทั้งหมด) + POS chips (dynamic, from card data); title shows `n/total` when filtering; resets filters on deck change
  - `App.css`: `.vc-search-wrap`, `.vc-search-input`, `.vc-filter-row`, `.vc-chip`, `.vc-chip--active`, `.vc-chip--pos`
  - No backend changes — pure client-side filter
- Code review fixes (2026-05-02) — complete ✓
  - `deck.controller.js`: JLPT rename guard (403) + response shape `{ deck: data }`
  - `vocab.controller.js`: `addVocabCard` pre-check before insert
  - `ReviewPage.jsx`: `masteredCount` path `c.review_log?.repetitions` + threshold `>= 3`
  - `references/known-issues.md`: logged as BUG-003
- Phase 17A — CLAUDE.md sync / Navigation audit (2026-05-02) — complete ✓
  - Confirmed Listening Practice + Deck Rename fully implemented but undocumented
  - Updated CLAUDE.md: API routes table, Implementation Status, Progress checklist, Features Planned, Next Steps
- BUG-002 fix — vocab edit duplicate word error (2026-05-02) — complete ✓
  - `vocab.controller.js`: pre-check in `updateVocabCard` + `23505` catch in `addVocabCard`
  - `references/known-issues.md`: BUG-002 logged
- Phase 16 — ProgressPage + Review redesign (2026-05-02) — complete ✓
  - `BottomNavBar.jsx`: "วันนี้" tab → `/progress` (was `/daily-quiz`); active highlight fixed
  - `ProgressPage.jsx`: mobile-first card layout + `.lp-page` sizing aligned to other pages
  - `ReviewPage.jsx`: single-mode lobby (stats card + mastered bar) + inline session progress bar
  - `ReviewCard.jsx`: 2-button grade (ไม่รู้ / รู้ ✓) replacing 4-grade system
  - `App.css`: new `.rv-*` CSS system for review lobby + session + grade buttons
- Live URLs:
  - Frontend: https://japan-learn-app-tbky.vercel.app
  - Backend:  https://japan-learn-app.onrender.com

---

## Next Steps

1. **Run DB migration** — open Supabase SQL Editor → run `server/scripts/006_daily_quiz_logs.sql` (creates `daily_quiz_logs` table for Daily Quiz feature)
2. **Deploy** — push to GitHub → Vercel + Render auto-deploy
3. **Top up Anthropic API credits** — console.anthropic.com/billing
4. **Seed N4–N1 grammar lessons** — `cd server && node scripts/seedGrammarLessons.js n4 n3 n2 n1`
