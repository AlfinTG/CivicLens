import hmac
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

from app.config import ADMIN_PASSWORD, ADMIN_TOKEN, APP_ENV
from app.schemas import AdminLogin, AdminLoginResponse

router = APIRouter()


def require_admin(authorization: Optional[str] = Header(None)):
    if APP_ENV == "production" or not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin authentication is not configured.")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization[len("Bearer "):]
    if not hmac.compare_digest(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/api/admin/login", response_model=AdminLoginResponse)
def admin_login(body: AdminLogin):
    if APP_ENV == "production" or not ADMIN_PASSWORD or not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin authentication is not configured.")
    if not hmac.compare_digest(body.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return AdminLoginResponse(token=ADMIN_TOKEN)
