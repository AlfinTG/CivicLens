import hashlib
import json
import re
import os
from pathlib import Path

VALID_TYPES = {"pothole", "damaged_road", "broken_streetlight", "drain_overflow", "garbage", "other", "no_issue"}
VALID_DEPARTMENTS = {"Roads & Public Works", "Electricity Board", "Water & Drainage", "Sanitation", "General"}

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "vision_prompt.txt"
CACHE_PATH = Path(__file__).parent.parent.parent / "seed" / "cache.json"

FALLBACK_RESULT = {
    "type": "other",
    "severity": 3,
    "description": "Issue reported, pending review.",
    "department": "General",
    "confidence": 0.0,
}

TIMEOUT_SECONDS = 10


def _load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _sha256(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()


def _load_cache() -> dict:
    if CACHE_PATH.exists():
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def _strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    return text.strip()


def _validate(result: dict) -> dict:
    if result.get("type") not in VALID_TYPES:
        result["type"] = "other"
    try:
        severity = int(result.get("severity", 3))
        if severity < 1 or severity > 5:
            severity = 3
    except (TypeError, ValueError):
        severity = 3
    result["severity"] = severity

    if result.get("department") not in VALID_DEPARTMENTS:
        result["department"] = "General"

    try:
        confidence = float(result.get("confidence", 0.0))
        confidence = max(0.0, min(1.0, confidence))
    except (TypeError, ValueError):
        confidence = 0.0
    result["confidence"] = confidence

    if not isinstance(result.get("description"), str) or not result["description"].strip():
        result["description"] = "Civic issue detected."

    return result


def _call_gemini(image_bytes: bytes, mime_type: str, prompt: str) -> dict:
    import google.generativeai as genai
    from app.config import VISION_API_KEY, VISION_MODEL

    genai.configure(api_key=VISION_API_KEY)
    model = genai.GenerativeModel(VISION_MODEL)

    image_part = {
        "inline_data": {
            "mime_type": mime_type,
            "data": image_bytes,
        }
    }

    response = model.generate_content(
        [prompt, image_part],
        generation_config={"response_mime_type": "application/json"},
        request_options={"timeout": TIMEOUT_SECONDS},
    )
    raw = response.text
    raw = _strip_fences(raw)
    return json.loads(raw)


def analyze_image(image_bytes: bytes, mime_type: str) -> dict:
    prompt = _load_prompt()

    # Level 1: Live API
    try:
        result = _call_gemini(image_bytes, mime_type, prompt)
        return _validate(result)
    except Exception as e:
        print(f"VISION API ERROR: {e}")
        pass

    # Level 2: SHA-256 cache
    try:
        sha = _sha256(image_bytes)
        cache = _load_cache()
        if sha in cache:
            return _validate(dict(cache[sha]))
    except Exception:
        pass

    # Level 3: Safe fallback
    return dict(FALLBACK_RESULT)
