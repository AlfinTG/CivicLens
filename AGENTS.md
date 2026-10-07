# AGENTS.md — CivicLens

> Read this fully before writing any code. This is the source of truth.
>
> **Current direction (owner brief, October 2026):** CivicLens is transitioning
> from a Hacktoberfest demo into a production civic issue reporting and
> resolution platform. The hackathon timeline, “no auth,” SQLite-only rule,
> frozen demo API contract, fixed issue states/priority formula, and “do not add
> features” restrictions in the historical sections below are superseded by
> the owner's current production brief. Preserve working behavior while
> migrating it safely; humans remain accountable for triage and closure.
> Production uses PostgreSQL and Alembic; SQLite is for local development only.
> Implement as a modular monolith, keep secrets out of source, and test each
> phase before calling it complete. Do not claim deployment or provider
> integration until it has been configured and verified.

## 1. What we're building

**CivicLens** — an AI-powered public infrastructure monitoring system.

A citizen uploads a photo of a civic issue (pothole, damaged road, broken streetlight, overflowing drain, garbage). A vision AI model detects the issue type, scores severity 1-5, picks the responsible department, and saves it with GPS. An admin dashboard shows all issues on a map, ranked by priority, with status updates.

**Hackathon:** Hactoberfest '26, Problem Statement 1.
**Time budget:** ~4 hours total. Two developers. **Working demo beats features.**

## 2. Golden rules for AI agents

1. Keep it simple. No auth, no login, no microservices, no Docker, no Redis.
2. Do NOT add features not listed here. Ask first.
3. Do NOT change the API contract (section 5) without telling both developers.
4. SQLite only. FastAPI backend. React + Vite frontend.
5. Every endpoint must work with the exact JSON fields in section 5.
6. All secrets in `.env`. Never hardcode API keys. Never commit `.env`.
7. If the vision API fails, use the fallback in section 7. The demo must never crash.
8. Short functions, plain code, minimal comments. Prefer working over clever.
9. After each task, run it and confirm it works before moving on.
10. Handle errors with a clear JSON message: `{"detail": "..."}`.

## 3. Tech stack

| Layer | Choice |
|---|---|
| Backend | Python 3.11+, FastAPI, Uvicorn, SQLite (SQLAlchemy) |
| AI | Vision LLM API (Gemini Flash or Claude), model set via `VISION_MODEL` in `.env` |
| Frontend | React + Vite, Tailwind CSS, react-leaflet (OpenStreetMap tiles) |
| HTTP | axios or fetch |
| Deploy | Run locally for demo; optional Render (backend) + Vercel (frontend) |

## 4. Project structure

See `PROJECT_STRUCTURE.md` in the repo root. Follow it exactly. Do not add, rename, or move files without telling both developers.

## 5. API contract (do not change)

Base URL: `http://localhost:8000`

### Issue object

```json
{
  "id": 1,
  "type": "pothole",
  "severity": 4,
  "description": "Large pothole in the middle of the lane, about 40cm wide.",
  "department": "Roads & Public Works",
  "confidence": 0.91,
  "lat": 22.7196,
  "lng": 75.8577,
  "image_url": "/uploads/abc123.jpg",
  "note": "Near main gate",
  "status": "open",
  "duplicate_count": 2,
  "priority_score": 78.5,
  "created_at": "2026-10-10T10:30:00Z"
}
```

**Allowed values**
- `type`: `pothole`, `damaged_road`, `broken_streetlight`, `drain_overflow`, `garbage`, `other`, `no_issue`
- `severity`: integer 1-5
- `status`: `open`, `in_progress`, `resolved`
- `department`: `Roads & Public Works`, `Electricity Board`, `Water & Drainage`, `Sanitation`, `General`

### Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/report` | multipart: `image` (file), `lat`, `lng`, `note` (optional) | Issue object |
| GET | `/api/issues` | query: `status` (optional) | list of Issue, sorted by `priority_score` desc |
| GET | `/api/issues/{id}` | none | Issue object |
| PATCH | `/api/issues/{id}` | `{"status": "in_progress"}` | updated Issue |
| GET | `/api/stats` | none | `{"total", "open", "in_progress", "resolved", "by_type": {...}}` |
| GET | `/api/health` | none | `{"ok": true}` |

If the AI says `no_issue`, still return 200 with the Issue object but do NOT save it. Frontend shows "No issue detected."

## 6. Priority formula

```
priority_score = severity * 15
               + min(age_hours, 72) / 72 * 15
               + min(duplicate_count, 5) * 2
```

Resolved issues are excluded from the main list (or shown at the bottom). Keep this in `services/priority.py` only.

## 7. Vision service

File: `backend/app/services/vision.py`

- Function: `analyze_image(image_bytes, mime_type) -> dict`
- Send the image plus the prompt from `prompts/vision_prompt.txt`.
- Require JSON-only output. Strip any ```json fences before parsing.
- Validate fields. If `type` or `severity` is invalid, clamp to `other` / 3.
- **Fallback chain:**
  1. Vision API result
  2. If it fails or times out (10s): look up the image SHA-256 in `seed/cache.json`
  3. Otherwise return `{"type": "other", "severity": 3, "description": "Issue reported, pending review.", "department": "General", "confidence": 0.0}`

### Vision prompt (`vision_prompt.txt`)

```
You are a public infrastructure inspector. Look at this photo and identify the civic issue.

Respond with ONLY a JSON object. No markdown, no explanation.

{
  "type": one of ["pothole","damaged_road","broken_streetlight","drain_overflow","garbage","other","no_issue"],
  "severity": integer 1-5 (1 = cosmetic, 3 = needs repair soon, 5 = immediate safety risk),
  "description": one short sentence describing what you see and why it matters,
  "department": one of ["Roads & Public Works","Electricity Board","Water & Drainage","Sanitation","General"],
  "confidence": number between 0 and 1
}

If the photo does not show a public infrastructure issue, use type "no_issue".
```

## 8. Duplicate detection

File: `services/duplicates.py`

- On new report, find existing non-resolved issues with the same `type` within **50 meters** (haversine).
- If found: increment `duplicate_count` on the existing issue, and still save the new report (or link it). Keep it simple: save new issue with `duplicate_count` = number of matches, and bump matches by 1.

## 9. Frontend requirements

### Report page (`/`)
- Big "Take / Upload photo" button (mobile camera friendly: `accept="image/*" capture="environment"`).
- Auto-fetch location with `navigator.geolocation`. Allow manual override if denied.
- Optional note field.
- Submit shows a loading state, then a **ResultCard** with type, severity badge, description, department.

### Admin dashboard (`/admin`)
- Top: StatsBar (total / open / in progress / resolved).
- Left or main: Leaflet map, pins colored by severity (1-2 green, 3 yellow, 4-5 red). Click pin shows photo + details.
- Right or below: table sorted by priority with status dropdown (calls PATCH).
- Auto-refresh every 10 seconds.

### Style
- Clean and modern, mobile-first. One accent color. No heavy animations.

## 10. Work split

**Dev A: Backend + AI**
1. FastAPI skeleton, DB model, CORS, `/api/health`
2. `vision.py` + prompt, test with 3 real photos
3. `POST /api/report`, `GET /api/issues`, `PATCH`, `/api/stats`
4. Priority + duplicates
5. Seed script + `cache.json`

**Dev B: Frontend**
1. Vite + Tailwind setup, routing
2. Report page with mock data first (`mock/issues.json`)
3. Admin dashboard: map, table, stats
4. Connect to real API via `api.js` once backend is ready
5. Polish + PPT

## 11. Timeline (4 hours)

| Time | Goal |
|---|---|
| 0:00-0:20 | Repo, this file, `.env`, collect 10 test photos, agree on API |
| 0:20-1:30 | Parallel work. A: working AI endpoint. B: UI on mock data |
| 1:30-2:15 | Integrate. One full flow: photo → AI → map pin |
| 2:15-3:00 | Priority ranking, status updates, duplicates, stats |
| 3:00-3:15 | **Feature freeze.** Bug fixes only |
| 3:15-4:00 | Seed demo data, PPT, rehearse demo twice |

## 12. Definition of done

- [ ] Upload a photo from phone, get AI result in under 5 seconds
- [ ] Issue appears on admin map with correct color
- [ ] Table sorted by priority, status can be changed
- [ ] Duplicate nearby report increases count
- [ ] Demo works with Wi-Fi flaky (fallback cache tested)
- [ ] 8-10 seeded issues around the demo location
- [ ] README with run steps, PPT ready

## 13. Run commands

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env   # add your API key
uvicorn app.main:app --reload --port 8000

# seed demo data
python seed/seed.py

# frontend
cd frontend
npm install
npm run dev
```

## 14. `.env.example`

```
VISION_API_KEY=your_key_here
VISION_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./civiclens.db
FRONTEND_ORIGIN=http://localhost:5173
```

## 15. Demo script (2 minutes)

1. "Potholes and broken lights go unreported for weeks. CivicLens fixes that."
2. Open the report page on a phone. Snap a pothole photo.
3. AI result appears: type, severity, department.
4. Switch to the admin dashboard. A new red pin is on the map.
5. Show the priority table, mark one issue "In progress."
6. Close with future scope: WhatsApp reporting, auto-email to municipal body, repair-time prediction.
