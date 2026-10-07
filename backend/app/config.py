import os
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
VISION_API_KEY = os.getenv("VISION_API_KEY", "")
VISION_MODEL = os.getenv("VISION_MODEL", "gemini-2.5-flash")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civiclens.db")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL.removeprefix("postgres://")
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL.removeprefix("postgresql://")

# Legacy single-admin authentication is disabled by default and will be replaced
# by the role-based identity module in the authentication phase.
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

if APP_ENV == "production":
    if not DATABASE_URL.startswith("postgresql+"):
        raise ValueError("Production requires a PostgreSQL DATABASE_URL.")
    origins = [origin.strip() for origin in FRONTEND_ORIGIN.split(",") if origin.strip()]
    if not origins or any("localhost" in origin or "127.0.0.1" in origin for origin in origins):
        raise ValueError("Production FRONTEND_ORIGIN must contain the HTTPS frontend origin.")
    if any(not origin.startswith("https://") for origin in origins):
        raise ValueError("Production FRONTEND_ORIGIN values must use HTTPS.")
