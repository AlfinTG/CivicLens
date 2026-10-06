# CivicLens — AI-Powered Public Infrastructure Monitor

> Hackathon: Hactoberfest '26 · Problem Statement 1

## What it does

Citizens upload a photo of a civic issue (pothole, broken streetlight, drain overflow, garbage). A vision AI classifies the issue, scores its severity, identifies the responsible department, and saves it with GPS coordinates. Admins see all issues on a map ranked by priority and can update statuses.

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Copy env template and add your Gemini API key
copy .env.example .env    # Windows
# cp .env.example .env    # Mac/Linux

uvicorn app.main:app --reload --port 8000
```

### Seed demo data

```bash
# from backend/ folder, with venv active:
python seed/seed.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

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
