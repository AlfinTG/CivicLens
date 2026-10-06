import os
from dotenv import load_dotenv

load_dotenv()

VISION_API_KEY = os.getenv("VISION_API_KEY", "")
VISION_MODEL = os.getenv("VISION_MODEL", "gemini-2.5-flash")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civiclens.db")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
