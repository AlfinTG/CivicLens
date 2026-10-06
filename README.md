# CivicLens

AI-powered public infrastructure monitoring system. 
A citizen uploads a photo of a civic issue (pothole, garbage, etc.). A vision AI model detects the issue type, scores severity, picks the department, and saves it with GPS. An admin dashboard shows all issues on a map, ranked by priority.

Built for Hactoberfest '26.

## Setup & Run

### Prerequisites
- Node.js v18+
- Python 3.11+

### Environment Setup
Create a `.env` file in the root based on `.env.example`:
```
VISION_API_KEY=your_key_here
VISION_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./civiclens.db
FRONTEND_ORIGIN=http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Seed demo data
python seed/seed.py

# Run backend
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` for the report page and `http://localhost:5173/admin` for the dashboard.
