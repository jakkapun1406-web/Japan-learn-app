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
│       │   ├── Deck/          # Deck management UI
│       │   ├── Flashcard/     # Flashcard review UI
│       │   ├── Layout/        # Shared layout wrappers
│       │   └── Vocabulary/    # Vocabulary list / detail UI
│       ├── constants/
│       │   └── jlptLevels.js  # N5–N1 level definitions
│       ├── hooks/
│       │   └── useAuth.js     # Supabase session hook
│       ├── lib/
│       │   └── supabaseClient.js  # Supabase browser client
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── services/          # API call helpers (axios)
│       ├── utils/
│       │   └── srsAlgorithm.js  # SM-2 / SRS scheduling logic
│       ├── App.jsx
│       └── main.jsx
│
├── server/                    # Express API backend
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── lib/
│   │   └── supabaseClient.js  # Supabase server-side client
│   ├── middleware/
│   │   └── auth.middleware.js # JWT / session verification
│   ├── routes/
│   │   └── auth.routes.js
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

| Method | Path                           | Auth | Description                        |
|--------|--------------------------------|------|------------------------------------|
| GET    | `/api/health`                  | No   | Server health check                |
| POST   | `/api/auth/register`           | No   | สมัครสมาชิก                        |
| POST   | `/api/auth/login`              | No   | เข้าสู่ระบบ                        |
| POST   | `/api/auth/logout`             | No   | ออกจากระบบ                         |
| GET    | `/api/decks`                   | Yes  | ดึง deck ทั้งหมด (filter by level) |
| POST   | `/api/decks`                   | Yes  | สร้าง deck ใหม่                    |
| DELETE | `/api/decks/:id`               | Yes  | ลบ deck                            |
| GET    | `/api/decks/:deckId/vocab`     | Yes  | ดึงคำศัพท์ใน deck                  |
| POST   | `/api/decks/:deckId/vocab`     | Yes  | เพิ่มคำศัพท์ใน deck                |
| DELETE | `/api/decks/:deckId/vocab/:cardId` | Yes | ลบคำศัพท์                      |
| GET    | `/api/decks/:deckId/review`    | Yes  | ดึงการ์ดที่ถึงเวลา review          |
| POST   | `/api/decks/:deckId/review`    | Yes  | ส่งผล review (grade 0–3)           |

CORS is whitelisted to `http://localhost:5173` only.

---

## Current Implementation Status

| Feature               | Status       |
|-----------------------|--------------|
| Auth (login/register) | Implemented  |
| SRS algorithm         | Implemented  |
| JLPT level constants  | Implemented  |
| Flashcard review UI   | In progress  |
| Deck management       | In progress  |
| Vocabulary list       | In progress  |
| Grammar lessons       | Planned      |
| Kana / Kanji reading  | Planned      |
| Listening / Speaking  | Planned      |
| Quiz after lesson     | Planned      |
| AI-assisted features  | Planned      |

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
| Package               | Purpose                        |
|-----------------------|--------------------------------|
| express v5            | HTTP server / routing          |
| @supabase/supabase-js | Supabase server-side client    |
| @anthropic-ai/sdk     | Claude AI integration          |
| cors                  | CORS middleware                |
| dotenv                | Load `.env` variables          |
| nodemon               | Dev auto-restart               |

---

## References

- `references/known-issues.md` — all logged bugs and their fixes. Read before debugging.
- `.env.example` — template for environment variables.
- Supabase dashboard — database schema, auth settings, RLS policies.

---

## Current Progress

- [x] Project setup complete (React + Vite + Node.js + Supabase)
- [x] Login page UI done (purple gradient background)
- [x] Supabase tables created: vocab_cards, decks
- [x] N5 vocabulary data inserted (8 words)
- [ ] Fix login page background fullscreen issue (in progress)
- [ ] Create API endpoint GET /api/vocab-cards
- [ ] Create Flashcard component

---

## Last Working On

- Fixing `.auth-page` background not filling full screen
- File: `client/src/App.css` (`.auth-page` styles) and `client/src/index.css` (`#root` reset)

---

## Next Steps

1. Confirm background fix works
2. Create vocab API endpoint in `server/`
3. Build Flashcard UI in `client/`
