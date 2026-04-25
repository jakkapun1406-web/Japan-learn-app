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

---

## Monorepo Layout

```
japanese-app/
├── client/                    # React + Vite frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── assets/            # Static images (hero.png, etc.)
│       ├── components/
│       │   ├── Auth/          # Login / register UI
│       │   ├── Deck/          # DeckCard.jsx — deck display + actions
│       │   ├── Flashcard/     # Flashcard review UI
│       │   ├── Layout/        # Shared layout wrappers
│       │   └── Vocabulary/    # VocabCard, AddVocabModal
│       ├── constants/
│       │   └── jlptLevels.js  # N5–N1 level definitions + JLPT_COLORS
│       ├── hooks/
│       │   └── useAuth.js     # Supabase session hook
│       ├── lib/
│       │   └── supabaseClient.js  # Supabase browser client
│       ├── pages/
│       │   ├── DashboardPage.jsx  # JLPT + user deck sections
│       │   ├── VocabPage.jsx      # Vocab list for a deck
│       │   ├── ReviewPage.jsx     # SRS flashcard review
│       │   ├── GrammarPage.jsx    # Lesson browser — tabs N5–N1 + lesson cards
│       │   ├── GrammarLessonPage.jsx  # Lesson detail + examples + mini-quiz
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── services/
│       │   ├── apiClient.js       # Axios instance
│       │   ├── deckService.js     # getDecks, createDeck, deleteDeck, initJlptDecks
│       │   ├── vocabService.js    # getVocabByDeck, addVocabCard, deleteVocabCard
│       │   └── grammarService.js  # getLessons, getLessonById
│       ├── utils/
│       │   └── srsAlgorithm.js    # SM-2 / SRS scheduling logic
│       ├── App.jsx
│       └── main.jsx
│
├── server/                    # Express API backend
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── deck.controller.js
│   │   ├── vocab.controller.js
│   │   ├── review.controller.js
│   │   ├── jlptVocab.controller.js
│   │   └── jlptDeck.controller.js   # initJlptDecks — auto-create N5–N1 decks
│   ├── lib/
│   │   └── supabaseClient.js  # Supabase server-side client
│   ├── middleware/
│   │   └── auth.middleware.js # JWT / session verification
│   ├── controllers/
│   │   └── grammar.controller.js    # getLessons, getLessonById
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── deck.routes.js
│   │   ├── vocab.routes.js
│   │   ├── review.routes.js
│   │   ├── jlptVocab.routes.js
│   │   ├── jlptDeck.routes.js       # POST /api/jlpt-decks/init
│   │   └── grammar.routes.js        # GET /api/grammar/:level, /api/grammar/lesson/:id
│   ├── scripts/
│   │   ├── 001_create_jlpt_vocab.sql    # Creates jlpt_vocab table
│   │   ├── 002_vocab_cards_unique_word.sql  # Unique(word, deck_id) constraint
│   │   ├── 003_add_deck_type.sql        # Adds deck_type col to user_decks
│   │   ├── 004_grammar_lessons.sql      # Creates grammar_lessons table (run in Supabase)
│   │   ├── seedJlptVocab.js             # Old seed (150 words, deprecated)
│   │   ├── seedJlptVocabFull.js         # Full seed via JMdict → Claude Haiku → Thai
│   │   └── seedGrammarLessons.js        # AI seed: 5 lessons × 5 levels via Claude Haiku
│   └── index.js               # Entry point — port 3001
│
├── references/
│   └── known-issues.md        # Bug log — READ BEFORE DEBUGGING
│
├── .env.example               # Root env template (keys only)
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
| GET    | `/api/health`                     | No   | Server health check                |
| POST   | `/api/auth/register`              | No   | สมัครสมาชิก                        |
| POST   | `/api/auth/login`                 | No   | เข้าสู่ระบบ                        |
| POST   | `/api/auth/logout`                | No   | ออกจากระบบ                         |
| GET    | `/api/decks`                      | Yes  | ดึง deck ทั้งหมด (incl. deck_type) |
| POST   | `/api/decks`                      | Yes  | สร้าง user deck (deck_type='user') |
| DELETE | `/api/decks/:id`                  | Yes  | ลบ deck                            |
| GET    | `/api/decks/:deckId/vocab`        | Yes  | ดึงคำศัพท์ใน deck                  |
| POST   | `/api/decks/:deckId/vocab`        | Yes  | เพิ่มคำศัพท์ใน deck                |
| DELETE | `/api/decks/:deckId/vocab/:cardId`| Yes  | ลบคำศัพท์                         |
| GET    | `/api/decks/:deckId/review`       | Yes  | ดึงการ์ดที่ถึงเวลา review          |
| POST   | `/api/decks/:deckId/review`       | Yes  | ส่งผล review (grade 0–3)           |
| POST   | `/api/jlpt-decks/init`            | Yes  | Auto-create JLPT N5–N1 decks       |
| GET    | `/api/jlpt-vocab`                 | Yes  | ดึง vocab จากคลัง jlpt_vocab       |
| GET    | `/api/grammar/:level`             | Yes  | ดึงรายการบทเรียน (N5–N1)           |
| GET    | `/api/grammar/lesson/:id`         | Yes  | ดึงบทเรียน + examples + quiz       |

CORS is whitelisted to `http://localhost:5173` only.

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
| Kana / Kanji reading            | Planned      |
| Listening / Speaking            | Planned      |
| AI-assisted features            | Planned      |

---

## Features Planned

- Flashcard / SRS vocabulary (spaced-repetition scheduling)
- Grammar lessons with structured exercises
- Hiragana / Katakana / Kanji reading practice
- Listening / Speaking practice
- Quiz after each lesson
- AI-powered hints and explanations via Anthropic Claude

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

## References

- `references/known-issues.md` — all logged bugs and their fixes. Read before debugging.
- `.env.example` — template for environment variables.
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

---

## Data Sources

| Source | URL | Notes |
|--------|-----|-------|
| JLPT Vocab API | `https://jlpt-vocab-api.vercel.app/api/words/all?level=5` | Confirmed working. level=5→N5, 4→N4, etc. |
| jmdict-simplified v3 | — | No JLPT tags in v3, not suitable |
| jbrooksuk/JLPT-Vocabulary | — | HTTP 404, repo gone |

---

## Last Working On

- Phase 7 — Grammar Lessons Module fully implemented
  - Migration 004 (`grammar_lessons` table with RLS + index) run in Supabase
  - Fixed UNIQUE constraint bug: added `UNIQUE (jlpt_level, title)` for upsert ON CONFLICT
  - Seeded N5 grammar lessons (5 lessons) via `node scripts/seedGrammarLessons.js n5`
  - N4–N1 seed failed — Anthropic API credits exhausted

---

## Next Steps

1. Top up Anthropic API credits at console.anthropic.com/billing
2. Seed remaining grammar lessons: `cd server && node scripts/seedGrammarLessons.js n4 n3 n2 n1`
3. End-to-end test: login → Dashboard → click ไวยากรณ์ → N5 lessons render → mini-quiz works
4. Plan next feature (Kana/Kanji reading practice or AI hints)
