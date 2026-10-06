from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

from app.config import ADMIN_PASSWORD, ADMIN_TOKEN
from app.schemas import AdminLogin, AdminLoginResponse

router = APIRouter()


def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization[len("Bearer "):]
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/api/admin/login", response_model=AdminLoginResponse)
def admin_login(body: AdminLogin):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return AdminLoginResponse(token=ADMIN_TOKEN)
