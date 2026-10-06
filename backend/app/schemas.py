from datetime import datetime, timezone
from pydantic import BaseModel, field_validator


class IssueOut(BaseModel):
    id: int
    type: str
    severity: int
    description: str
    department: str
    confidence: float
    lat: float
    lng: float
    image_url: str
    note: str
    status: str
    duplicate_count: int
    priority_score: float
    created_at: datetime

    @field_validator("created_at", mode="before")
    @classmethod
    def ensure_utc(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    model_config = {"from_attributes": True}


class StatusPatch(BaseModel):
    status: str


class StatsOut(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    by_type: dict[str, int]


class AdminLogin(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    token: str
