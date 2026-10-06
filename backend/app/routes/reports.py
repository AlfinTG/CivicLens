import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Issue
from app.schemas import IssueOut
from app.services.vision import analyze_image
from app.services.duplicates import find_and_update_duplicates
from app.services.priority import calculate_priority

router = APIRouter()

UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"}


@router.post("/api/report", response_model=IssueOut)
async def create_report(
    image: UploadFile = File(...),
    lat: float = Form(...),
    lng: float = Form(...),
    note: str = Form(""),
    db: Session = Depends(get_db),
):
    # Validate image
    if image.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Unsupported image type. Use JPEG, PNG, or WebP.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image file is empty.")

    # Validate coordinates
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates.")

    # Save image
    ext = Path(image.filename or "upload.jpg").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOADS_DIR / filename
    dest.write_bytes(image_bytes)
    image_url = f"/uploads/{filename}"

    # Analyze
    ai = analyze_image(image_bytes, image.content_type)

    # no_issue path — return without persisting
    if ai.get("type") == "no_issue":
        return IssueOut(
            id=0,
            type="no_issue",
            severity=ai.get("severity", 1),
            description=ai.get("description", "No civic issue detected in this photo."),
            department=ai.get("department", "General"),
            confidence=ai.get("confidence", 0.0),
            lat=lat,
            lng=lng,
            image_url=image_url,
            note=note,
            status="open",
            duplicate_count=0,
            priority_score=0.0,
            created_at=datetime.now(timezone.utc),
        )

    # Duplicate detection
    dup_count = find_and_update_duplicates(db, ai["type"], lat, lng)

    # Priority
    now = datetime.now(timezone.utc)
    priority = calculate_priority(ai["severity"], now, dup_count)

    issue = Issue(
        type=ai["type"],
        severity=ai["severity"],
        description=ai["description"],
        department=ai["department"],
        confidence=ai["confidence"],
        lat=lat,
        lng=lng,
        image_url=image_url,
        note=note,
        status="open",
        duplicate_count=dup_count,
        priority_score=priority,
        created_at=now,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue
