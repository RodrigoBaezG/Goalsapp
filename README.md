# Goals App

A focused goal tracker that helps you stay honest about what you're actually working toward. Create goals with a custom frequency (day / week / month / year), log progress with one click, and watch a per-goal progress bar fill up.

Live demo: <https://rodrigogoals-app.netlify.app>

## Features

- Email + password authentication backed by JWT.
- Goals CRUD: create, edit, delete, and one-click "mark completed".
- Frequency-based tracking (day / week / month / year) with progress percentage.
- One-click **portfolio demo mode** — log in with the demo button to explore the app with seven pre-loaded mock goals; no signup, no backend writes.
- Responsive UI with a split hero/form login screen.

## Tech stack

**Frontend** (`frontend/`)

- React 19 + Vite 7
- React Router 7
- TypeScript (partial — types coexist with `.jsx`)
- Tailwind CSS 4
- Jest + React Testing Library

**Backend** (`backend/`)

- Express 4 (Node.js)
- PostgreSQL via `pg-promise`
- JWT auth (`express-jwt` + `jsonwebtoken`)
- `bcrypt` password hashing
- `express-validator` for input validation
- Jest + Supertest

## Project structure

```
Goalsapp/
├── frontend/                    # React + Vite client
│   ├── src/
│   │   ├── components/          # public/, private/, shared/
│   │   ├── memory/              # React Context + reducers (auth, goals)
│   │   ├── services/            # Auth.ts, Goals.ts, demo.ts
│   │   ├── types/               # GoalType, CredentialsType
│   │   └── App.jsx, main.tsx
│   ├── index.html
│   └── package.json
├── backend/                     # Express API
│   ├── routes/                  # accounts.js, goals.js, index.js
│   ├── db/                      # config.js (pg-promise), requests.js
│   ├── __tests__/               # accounts.test.js, goals.test.js
│   ├── app.js                   # entry point + table bootstrap
│   └── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ running locally (or any reachable Postgres instance)

### 1. Clone and install

```bash
git clone <repo-url>
cd Goalsapp

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment variables

**Backend** — create `backend/.env` (or export inline):

```bash
JWT_SECRET=replace-with-a-long-random-string
PORT=3000
FRONTEND_URL=http://localhost:5173

# Option A: full connection string (production-style)
DATABASE_URL=postgres://user:password@host:5432/goalsapp

# Option B: local Postgres (uses host=localhost, db=goalsapp)
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
```

If you go with Option B, create the database first:

```bash
createdb goalsapp
```

The backend auto-creates the `accounts` and `goals` tables on startup — no migration step required.

**Frontend** — create `frontend/.env` (optional; defaults to `http://localhost:3000`):

```bash
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Run in development

```bash
# Terminal 1 — backend (http://localhost:3000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open <http://localhost:5173> and either sign up, log in, or click **Try Demo — no sign up needed** to explore with mock data.

## Demo mode

The "Try Demo" button on the login screen activates a **frontend-only** demo experience:

- Seven seeded mock goals (📚 reading, 🏋️ workout, 💻 side projects, 🌱 meditation, 💦 water, 🎵 guitar, ✈️ travel) load instantly.
- All CRUD operations (create / edit / delete / increment) run against `localStorage` — the backend is never hit.
- Logging out clears the demo flag and the seeded goals.

This is intended for portfolio / interview reviewers who want to poke around without creating an account or mutating real data.

Implementation lives in `frontend/src/services/demo.ts` and is wired through `frontend/src/services/Goals.ts` via short-circuit guards.

## Scripts

### Backend

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `npm start`       | Run the API with Node (production-style)    |
| `npm run dev`     | Run with `nodemon` (auto-reload)            |
| `npm test`        | Jest test suite (Supertest integration)     |
| `npm run test:watch` | Jest in watch mode                       |

### Frontend

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Vite dev server with HMR                  |
| `npm run build`      | Production build to `dist/`               |
| `npm run preview`    | Preview the production build              |
| `npm run lint`       | ESLint over the project                   |
| `npm run format`     | Prettier write                            |
| `npm test`           | Jest + React Testing Library              |
| `npm run test:watch` | Jest in watch mode                        |
| `npm run test:coverage` | Coverage report                        |
| `npm run deploy`     | Build + publish `dist/` via `gh-pages`    |

## API

All `/api/goals` routes require a `Bearer <token>` header. The token is returned by `/api/signup` and `/api/login`.

| Method | Endpoint          | Body / Notes                                                       |
| ------ | ----------------- | ------------------------------------------------------------------ |
| POST   | `/api/signup`     | `{ username (email), password (≥8 chars) }` → `{ token }`          |
| POST   | `/api/login`      | `{ username, password }` → `{ token }`                             |
| GET    | `/api/goals`      | List the authenticated user's goals                                |
| GET    | `/api/goals/:id`  | Single goal (must belong to the user)                              |
| POST   | `/api/goals`      | `{ details (≥5), icon, events, goal, period_, deadline, completed }` |
| PUT    | `/api/goals/:id`  | Same body as POST                                                  |
| DELETE | `/api/goals/:id`  | 204 on success                                                     |

## Database schema

Auto-created on backend startup:

```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    hash     VARCHAR(255) NOT NULL
);

CREATE TABLE goals (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    details      VARCHAR(255) NOT NULL,
    icon         TEXT,
    events       INTEGER,
    goal         INTEGER,
    period_      VARCHAR(50),
    deadline     DATE,
    completed    INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE
);
```

## Deployment

- **Frontend**: Netlify (current production deploy at <https://rodrigogoals-app.netlify.app>). `npm run build` outputs to `dist/`. Set `VITE_API_BASE_URL` to your backend URL in the Netlify env settings.
- **Backend**: Any Node host that can reach a Postgres instance (Render, Railway, Fly, etc.). Required env vars: `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`. The CORS allowlist in `backend/app.js` includes `FRONTEND_URL` plus the Netlify domain.

## Testing

```bash
# Backend integration tests (Supertest)
cd backend && npm test

# Frontend component + reducer tests (RTL + Jest)
cd frontend && npm test
```

## Author

Rodrigo Baez — [Portfolio](https://github.com/Rkbaez)
