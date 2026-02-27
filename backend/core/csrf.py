"""CSRF protection — double-submit cookie pattern."""
import secrets
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from config import ENVIRONMENT

SAFE_METHODS = ("GET", "HEAD", "OPTIONS", "TRACE")
CSRF_COOKIE = "csrf_token"
CSRF_HEADER = "X-CSRF-Token"
CSRF_EXEMPT = (
    "/auth/login",
    "/auth/register",
    "/auth/google",
    "/auth/logout",
    "/auth/send-registration-code",
)


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        method = request.method.upper()
        path = request.url.path or ""

        # Check CSRF BEFORE the endpoint executes
        if method not in SAFE_METHODS and not any(path.startswith(p) for p in CSRF_EXEMPT):
            header_val = request.headers.get(CSRF_HEADER)
            cookie_val = request.cookies.get(CSRF_COOKIE)
            if not header_val or not cookie_val or not secrets.compare_digest(header_val, cookie_val):
                return JSONResponse(
                    {"detail": "CSRF validation failed"},
                    status_code=403,
                )

        response = await call_next(request)

        # Set CSRF cookie if absent
        if not request.cookies.get(CSRF_COOKIE):
            csrf_val = secrets.token_urlsafe(32)
            response.set_cookie(
                CSRF_COOKIE,
                csrf_val,
                httponly=False,
                secure=ENVIRONMENT == "production",
                samesite="lax",
                max_age=86400 * 7,
            )

        return response
