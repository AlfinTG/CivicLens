"""
Seed script — inserts 8-10 demo issues around Indore, MP (lat 22.7196, lng 75.8577).
Safe to re-run: skips if issues already exist.
Run from the backend/ folder:  python seed/seed.py
"""

import sys
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db import SessionLocal, create_tables
from app.models import Issue
from app.services.priority import calculate_priority

DEMO_ISSUES = [
    {
        "type": "pothole",
        "severity": 5,
        "description": "Deep pothole spanning half the lane, causing vehicle damage.",
        "department": "Roads & Public Works",
        "confidence": 0.95,
        "lat": 22.7196,
        "lng": 75.8577,
        "note": "Near main gate, MB Road",
        "status": "open",
        "duplicate_count": 3,
        "age_hours": 48,
    },
    {
        "type": "broken_streetlight",
        "severity": 4,
        "description": "Streetlight completely dark, creating safety hazard at night.",
        "department": "Electricity Board",
        "confidence": 0.88,
        "lat": 22.7205,
        "lng": 75.8590,
        "note": "Post #47, near bus stop",
        "status": "open",
        "duplicate_count": 1,
        "age_hours": 72,
    },
    {
        "type": "drain_overflow",
        "severity": 5,
        "description": "Storm drain overflowing onto road, spreading sewage water.",
        "department": "Water & Drainage",
        "confidence": 0.91,
        "lat": 22.7185,
        "lng": 75.8563,
        "note": "Flooding pedestrian path",
        "status": "open",
        "duplicate_count": 2,
        "age_hours": 24,
    },
    {
        "type": "garbage",
        "severity": 3,
        "description": "Overflowing garbage dump blocking footpath.",
        "department": "Sanitation",
        "confidence": 0.87,
        "lat": 22.7210,
        "lng": 75.8555,
        "note": "Behind vegetable market",
        "status": "open",
        "duplicate_count": 0,
        "age_hours": 12,
    },
    {
        "type": "damaged_road",
        "severity": 4,
        "description": "Large section of road surface collapsed, sharp edges exposed.",
        "department": "Roads & Public Works",
        "confidence": 0.90,
        "lat": 22.7180,
        "lng": 75.8600,
        "note": "Connecting road to college",
        "status": "in_progress",
        "duplicate_count": 1,
        "age_hours": 60,
    },
    {
        "type": "pothole",
        "severity": 3,
        "description": "Cluster of small potholes slowing traffic and damaging tyres.",
        "department": "Roads & Public Works",
        "confidence": 0.82,
        "lat": 22.7220,
        "lng": 75.8570,
        "note": "School zone, needs urgent fix",
        "status": "open",
        "duplicate_count": 0,
        "age_hours": 6,
    },
    {
        "type": "garbage",
        "severity": 2,
        "description": "Scattered litter along sidewalk after weekend market.",
        "department": "Sanitation",
        "confidence": 0.79,
        "lat": 22.7195,
        "lng": 75.8540,
        "note": "Sunday market aftermath",
        "status": "resolved",
        "duplicate_count": 0,
        "age_hours": 96,
    },
    {
        "type": "broken_streetlight",
        "severity": 3,
        "description": "Flickering streetlight causing discomfort; likely faulty ballast.",
        "department": "Electricity Board",
        "confidence": 0.75,
        "lat": 22.7230,
        "lng": 75.8595,
        "note": "Near ATM kiosk",
        "status": "open",
        "duplicate_count": 0,
        "age_hours": 36,
    },
    {
        "type": "drain_overflow",
        "severity": 4,
        "description": "Blocked drain causing water to pool on road surface.",
        "department": "Water & Drainage",
        "confidence": 0.84,
        "lat": 22.7175,
        "lng": 75.8580,
        "note": "After last night's rain",
        "status": "open",
        "duplicate_count": 1,
        "age_hours": 10,
    },
    {
        "type": "other",
        "severity": 2,
        "description": "Broken bench in public park creating trip hazard.",
        "department": "General",
        "confidence": 0.65,
        "lat": 22.7215,
        "lng": 75.8610,
        "note": "Park near civil hospital",
        "status": "open",
        "duplicate_count": 0,
        "age_hours": 20,
    },
]


def main():
    create_tables()
    db = SessionLocal()
    try:
        existing = db.query(Issue).count()
        if existing > 0:
            print(f"Database already has {existing} issues. Skipping seed.")
            return

        now = datetime.now(timezone.utc)
        for data in DEMO_ISSUES:
            age_hours = data.pop("age_hours")
            created_at = now - timedelta(hours=age_hours)
            priority = calculate_priority(data["severity"], created_at, data["duplicate_count"])
            issue = Issue(
                **data,
                image_url="/uploads/seed_placeholder.jpg",
                created_at=created_at,
                priority_score=priority,
            )
            db.add(issue)

        db.commit()
        print(f"Seeded {len(DEMO_ISSUES)} demo issues.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
