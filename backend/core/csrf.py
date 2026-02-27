"""CSRF protection (упрощённая — exempt для auth endpoints)"""
import secrets
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from config import ENVIRONMENT

SAFE_METHODS = ("GET", "HEAD", "OPTIONS", "TRACE")
CSRF_COOKIE = "csrf_token"
CSRF_HEADER = "X-CSRF-Token"
CSRF_EXEMPT = ("/auth/login", "/auth/register", "/auth/google", "/auth/logout", "/auth/send-registration-code")


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        csrf_val = request.cookies.get(CSRF_COOKIE)
        if not csrf_val:
            csrf_val = secrets.token_urlsafe(32)
            response.set_cookie(
                CSRF_COOKIE,
                csrf_val,
                httponly=False,
                secure=ENVIRONMENT == "production",
                samesite="lax",
            )
        method = request.method.upper()
        path = request.url.path or ""
        if method not in SAFE_METHODS and not any(path.startswith(p) for p in CSRF_EXEMPT):
            header_val = request.headers.get(CSRF_HEADER)
            cookie_val = request.cookies.get(CSRF_COOKIE)
            if not header_val or not cookie_val or header_val != cookie_val:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")
        return response
