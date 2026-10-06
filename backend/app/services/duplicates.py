import math
from sqlalchemy.orm import Session

from app.models import Issue

DUPLICATE_RADIUS_METERS = 50


def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_and_update_duplicates(db: Session, issue_type: str, lat: float, lng: float) -> int:
    candidates = (
        db.query(Issue)
        .filter(Issue.type == issue_type, Issue.status != "resolved")
        .all()
    )
    matches = [
        c for c in candidates
        if haversine_meters(lat, lng, c.lat, c.lng) <= DUPLICATE_RADIUS_METERS
    ]
    for match in matches:
        match.duplicate_count += 1
    if matches:
        db.flush()
    return len(matches)
