$ErrorActionPreference = "Stop"

Write-Host "Installing dependencies..."
.\venv\Scripts\Activate.ps1
pip install --no-cache-dir -r requirements.txt

Write-Host "Seeding database..."
python seed/seed.py

Write-Host "Starting backend server..."
uvicorn app.main:app --reload --port 8000
