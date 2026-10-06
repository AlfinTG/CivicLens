# PROJECT_STRUCTURE.md — CivicLens

Create this exact structure at the start. Dev A owns `backend/`, Dev B owns `frontend/`. Shared files are edited by whoever needs them, after a quick heads-up.

## Folder tree

```
civiclens/
├── AGENTS.md
├── PROJECT_STRUCTURE.md
├── README.md
├── .env.example
├── .gitignore
│
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routes/
│   │   │   ├── reports.py
│   │   │   └── issues.py
│   │   ├── services/
│   │   │   ├── vision.py
│   │   │   ├── priority.py
│   │   │   └── duplicates.py
│   │   └── prompts/
│   │       └── vision_prompt.txt
│   ├── uploads/
│   └── seed/
│       ├── seed.py
│       ├── cache.json
│       └── images/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── mock/
│       │   └── issues.json
│       ├── pages/
│       │   ├── ReportPage.jsx
│       │   └── AdminDashboard.jsx
│       └── components/
│           ├── ResultCard.jsx
│           ├── IssueMap.jsx
│           ├── IssueTable.jsx
│           ├── StatusBadge.jsx
│           └── StatsBar.jsx
│
└── docs/
    └── pitch.md
```

## What each file does

### Root

| File | Purpose |
|---|---|
| `AGENTS.md` | Rules and spec for the AI coding agents |
| `PROJECT_STRUCTURE.md` | This file |
| `README.md` | Run steps, screenshots, short description |
| `.env.example` | Template for API key and settings |
| `.gitignore` | Ignore `.env`, `venv/`, `node_modules/`, `uploads/`, `*.db` |

### Backend (Dev A)

| File | Purpose |
|---|---|
| `app/main.py` | Creates the FastAPI app, enables CORS, mounts `/uploads` as static, includes the routers |
| `app/config.py` | Loads `.env` values (API key, model name, DB URL, frontend origin) |
| `app/db.py` | SQLite engine and session helper, creates tables on startup |
| `app/models.py` | `Issue` table (all fields from the API contract) |
| `app/schemas.py` | Pydantic models for responses and the PATCH body |
| `app/routes/reports.py` | `POST /api/report`: saves image, calls vision, checks duplicates, stores issue |
| `app/routes/issues.py` | `GET /api/issues`, `GET /api/issues/{id}`, `PATCH /api/issues/{id}`, `GET /api/stats`, `GET /api/health` |
| `app/services/vision.py` | Sends image + prompt to the vision API, parses JSON, handles fallback |
| `app/services/priority.py` | Priority score formula |
| `app/services/duplicates.py` | Finds same-type issues within 50 m using haversine distance |
| `app/prompts/vision_prompt.txt` | The JSON-only prompt sent with every image |
| `uploads/` | Saved report photos (gitignored) |
| `seed/seed.py` | Inserts 8-10 demo issues around the demo location |
| `seed/cache.json` | Cached AI results keyed by image SHA-256, used if the API fails |
| `seed/images/` | Demo photos |
| `requirements.txt` | `fastapi`, `uvicorn`, `sqlalchemy`, `python-multipart`, `python-dotenv`, and the vision SDK |

### Frontend (Dev B)

| File | Purpose |
|---|---|
| `src/main.jsx` | App entry point |
| `src/App.jsx` | Simple routing: `/` is the report page, `/admin` is the dashboard |
| `src/api.js` | All API calls in one place. Has a flag to switch between mock data and the real backend |
| `src/mock/issues.json` | Fake issues so the UI works before the backend is ready |
| `src/pages/ReportPage.jsx` | Photo upload, auto-location, note field, result card |
| `src/pages/AdminDashboard.jsx` | Stats bar, map, priority table, auto-refresh every 10 s |
| `src/components/ResultCard.jsx` | Shows type, severity, description, department after a report |
| `src/components/IssueMap.jsx` | Leaflet map, pins colored by severity |
| `src/components/IssueTable.jsx` | Issues sorted by priority with status dropdown |
| `src/components/StatusBadge.jsx` | Small colored badge for open / in progress / resolved |
| `src/components/StatsBar.jsx` | Total, open, in progress, resolved counts |
| `package.json` deps | `react`, `react-dom`, `react-router-dom`, `leaflet`, `react-leaflet`, `axios`, `tailwindcss` |

### Docs

| File | Purpose |
|---|---|
| `docs/pitch.md` | PPT outline and demo script |

## Setup commands

```bash
# create the skeleton
mkdir -p civiclens/backend/app/{routes,services,prompts} \
         civiclens/backend/{uploads,seed/images} \
         civiclens/frontend/src/{mock,pages,components} \
         civiclens/docs

cd civiclens
touch AGENTS.md PROJECT_STRUCTURE.md README.md .env.example .gitignore
touch backend/requirements.txt \
      backend/app/{main,config,db,models,schemas}.py \
      backend/app/routes/{reports,issues}.py \
      backend/app/services/{vision,priority,duplicates}.py \
      backend/app/prompts/vision_prompt.txt \
      backend/seed/{seed.py,cache.json}
touch docs/pitch.md
```

For the frontend, run `npm create vite@latest frontend -- --template react` inside `civiclens/`, then add Tailwind, Leaflet, and the rest.

## Rules

- Don't create files outside this structure without telling the other dev.
- Keep all API calls in `api.js` and all AI logic in `vision.py`.
- Keep the priority formula only in `priority.py`.
