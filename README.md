# Canvas → Notion Sync

A full-stack web app that pulls assignment data from Canvas LMS and pushes it into Notion in a clean, consistent format — giving students a single organized dashboard for all their coursework.

**Live app → [canvas-to-notion-sync.vercel.app](https://canvas-to-notion-sync.vercel.app)**

---

## The problem

Canvas is inconsistent. Every professor structures their course differently — some bury assignments in modules, some post them directly, some don't set due dates at all. Keeping track of work across 4+ courses is genuinely difficult.

Notion is clean, filterable, and customizable. This app bridges the two: Canvas holds the source of truth, Notion becomes the workspace.

---

## What it does

- Connects to your Canvas account via personal access token
- Fetches all assignments across all active courses
- Writes them into a Notion database in a standardized format
- Updates existing entries on re-sync — no duplicates, ever
- Supports multiple users, each with their own credentials and data

---

## Demo

| Screen | Description |
|---|---|
| Login / register | Create an account to get started |
| Connect accounts | Enter your Canvas token + Notion integration credentials |
| Dashboard | Trigger a sync and view history |
| Notion result | All assignments organized by course, due date, status, and type |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database | SQLite via Prisma ORM |
| Auth | JWT tokens, bcrypt password hashing |
| APIs | Canvas LMS REST API, Notion API |
| Deployment | Vercel (frontend), Railway (backend) |

---

## How the sync works

1. **Fetch** — Canvas API returns all assignments across all enrolled courses
2. **Normalize** — raw Canvas objects are cleaned into a consistent shape (title, course, due date, status, type, points, URL)
3. **Deduplicate** — the app checks a `SyncMap` table for an existing Canvas ID → Notion page ID mapping
4. **Write** — new assignments are created in Notion, existing ones are updated
5. **Log** — each sync run is recorded with a count of created / updated / failed

Re-syncing is always safe. The `SyncMap` table remembers every assignment ever written to Notion, so nothing gets duplicated.

---

## Notion database structure

| Column | Type | Description |
|---|---|---|
| Name | Title | Assignment title |
| Course | Select | Course name |
| Due Date | Date | Due date from Canvas |
| Status | Select | Not Started / Submitted / Overdue |
| Assignment Type | Select | Assignment / Quiz / Discussion / Other |
| Points | Number | Points possible |
| Canvas ID | Text | Used internally for deduplication |
| Canvas URL | URL | Direct link back to Canvas |
| Description | Text | Assignment description (HTML stripped) |
| Last Synced | Date | Timestamp of last sync |

---

## Running locally

### Prerequisites
- Node.js 18+
- A Canvas account with API access
- A Notion account with an integration

### Setup

```bash
git clone https://github.com/00abel/canvas-to-notion-sync.git
cd canvas-to-notion-sync

# Install dependencies
cd server && npm install
cd ../client && npm install

# Configure environment
cd ../server
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, FRONTEND_URL

# Initialize database
npx prisma db push --schema=src/db/schema.prisma

# Run backend (port 3001)
npm run dev

# Run frontend (port 5173) — new terminal
cd ../client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | `file:./dev.db` for local SQLite |
| `JWT_SECRET` | Random 32-byte hex string |
| `FRONTEND_URL` | Frontend origin for CORS |
| `VITE_API_URL` | Backend URL (frontend only) |

---

## Project structure

```
canvas-to-notion-sync/
├── server/
│   └── src/
│       ├── routes/
│       │   ├── auth.js          # Register, login endpoints
│       │   ├── config.js        # Save Canvas/Notion credentials
│       │   └── sync.js          # Trigger sync, view logs
│       ├── services/
│       │   ├── canvasService.js # Canvas API + normalization
│       │   ├── notionService.js # Notion API reads/writes
│       │   ├── syncEngine.js    # Orchestration + dedup logic
│       │   └── auth.js          # JWT + bcrypt helpers
│       └── db/
│           ├── schema.prisma    # Database schema
│           └── db.js            # Prisma client
└── client/
    └── src/
        ├── pages/
        │   ├── AuthPage.jsx     # Login / register
        │   ├── Dashboard.jsx    # Sync controls + history
        │   └── ConfigPage.jsx   # Account setup
        ├── hooks/
        │   └── useAuth.jsx      # Auth context
        └── lib/
            └── api.js           # API client
```

---

## Deployment

- **Backend** — Railway, with `npx prisma db push --schema=src/db/schema.prisma && node src/index.js` as the start command
- **Frontend** — Vercel, with `VITE_API_URL` pointing to the Railway backend

---

## Roadmap

- [ ] Auto-sync on a schedule using `node-cron`
- [ ] Priority tagging based on due date proximity
- [ ] Overdue assignment highlighting
- [ ] OAuth flow so users don't need to manually generate Canvas tokens
- [ ] Dashboard analytics and charts
