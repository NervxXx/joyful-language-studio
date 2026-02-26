"""Конфигурация приложения English Studio Backend"""
import os
from pathlib import Path

repo_root = Path(__file__).parent.parent.parent
from dotenv import load_dotenv

load_dotenv(repo_root / ".env")
load_dotenv(repo_root / ".env.local", override=True)

# Режим окружения
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

# Безопасность
SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY не установлен. Сгенерируйте: python -c 'import secrets; print(secrets.token_urlsafe(64))'"
    )
if len(SECRET_KEY) < 32:
    raise ValueError("SECRET_KEY должен быть минимум 32 символа")

# База данных (из .env, загруженного выше)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL не установлен. Пример: postgresql://user:pass@localhost:5432/english_studio"
    )

# CORS
if ENVIRONMENT == "production":
    raw_origins = os.getenv("ALLOWED_ORIGINS", "")
    ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]
    if not ALLOWED_ORIGINS:
        raise ValueError("ALLOWED_ORIGINS обязательна в production")
else:
    ALLOWED_ORIGINS = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    ).split(",")

# OpenRouter / LLM
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "dummy-key")

# Google OAuth (опционально)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_ADDITIONAL_CLIENT_IDS = os.getenv("GOOGLE_ADDITIONAL_CLIENT_IDS", "")
GOOGLE_ALLOWED_CLIENT_IDS = [
    cid.strip() for cid in [GOOGLE_CLIENT_ID, *GOOGLE_ADDITIONAL_CLIENT_IDS.split(",")]
    if cid and cid.strip()
]

# Cookies
COOKIE_SECURE = os.getenv("COOKIE_SECURE", str(ENVIRONMENT == "production")).lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "none" if ENVIRONMENT == "production" else "lax").lower()

# Dev
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
PORT = int(os.getenv("PORT", "8000"))
