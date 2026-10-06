from datetime import datetime, timezone


def calculate_priority(severity: int, created_at: datetime, duplicate_count: int) -> float:
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    age_hours = (now - created_at).total_seconds() / 3600
    score = (
        severity * 15
        + min(age_hours, 72) / 72 * 15
        + min(duplicate_count, 5) * 2
    )
    return round(score, 2)
