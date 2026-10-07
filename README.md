# CivicLens — AI-Powered Public Infrastructure Monitor

> Hackathon: Hactoberfest '26 · Problem Statement 1

## What it does

Citizens upload a photo of a civic issue (pothole, broken streetlight, drain overflow, garbage). A vision AI classifies the issue, scores its severity, identifies the responsible department, and saves it with GPS coordinates. Admins see all issues on a map ranked by priority and can update statuses.

## Quick Start

### Prerequisites
- Node.js v18+
- Python 3.11+

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Copy the environment template. Add secrets only to your local .env file.
copy .env.example .env    # Windows
# cp .env.example .env    # Mac/Linux

# Apply versioned database migrations before starting the API.
alembic upgrade head

uvicorn app.main:app --reload --port 8000
```

### Seed demo data

```bash
# from backend/ folder, with venv active:
python seed/seed.py
```

The default local database is SQLite for development. Production must set
`APP_ENV=production`, an HTTPS `FRONTEND_ORIGIN`, and a PostgreSQL
`DATABASE_URL` (the `postgresql://` and `postgres://` URL forms are normalized
to the psycopg 3 driver). Database tables are managed only through Alembic;
the API no longer creates or mutates schema at startup.

The initial migration recognizes the repository's legacy `issues` table,
preserves its rows, and adds indexes. Back up an existing database before
migrating it. For production, first rehearse the migration against a restored
backup and verify row counts and representative records before cutover.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` for the report page and `http://localhost:5173/admin` for the dashboard.

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/report` | Submit photo + GPS |
| GET | `/api/issues` | List all issues (priority sorted) |
| GET | `/api/issues/{id}` | Get single issue |
| PATCH | `/api/issues/{id}` | Update status |
| GET | `/api/stats` | Summary counts |

## Environment variables

```
VISION_API_KEY=your_gemini_api_key
VISION_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./civiclens.db
FRONTEND_ORIGIN=http://localhost:5173
```

## Tech stack

- **Backend:** Python 3.11+, FastAPI, SQLite, SQLAlchemy
- **AI:** Google Gemini (Vision LLM)
- **Frontend:** React + Vite, Tailwind CSS, react-leaflet
