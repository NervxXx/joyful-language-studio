"""English Studio Backend"""
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

backend_dir = Path(__file__).parent
repo_root = backend_dir.parent
load_dotenv(repo_root / ".env")
load_dotenv(repo_root / ".env.local", override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import status
import logging

from core.database import create_db_and_tables
from core.security import SecurityHeadersMiddleware
from core.rate_limiter import RateLimitMiddleware
from core.csrf import CSRFMiddleware
from config import ALLOWED_ORIGINS, ENVIRONMENT
from api.auth import router as auth_router
from api.chat import router as chat_router
from api.vocabulary import router as vocabulary_router
from api.stats import router as stats_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


_is_prod = ENVIRONMENT == "production"
app = FastAPI(
    title="English Studio API",
    description="Backend для приложения изучения языков",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
    openapi_url=None if _is_prod else "/openapi.json",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(CSRFMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token", "X-User-Timezone"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(vocabulary_router)
app.include_router(stats_router)


@app.get("/")
def root():
    return {"message": "English Studio API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def validation_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Ошибка валидации данных"},
    )


if __name__ == "__main__":
    import uvicorn
    from config import PORT
    uvicorn.run(app, host="0.0.0.0", port=PORT)
