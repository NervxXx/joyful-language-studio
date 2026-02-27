"""Security utilities and middleware"""
import re
from typing import Tuple, Optional
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from config import ENVIRONMENT

# Password validation
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
REQUIRE_UPPERCASE = True
REQUIRE_LOWERCASE = True
REQUIRE_DIGIT = True
REQUIRE_SPECIAL = False
UPPERCASE_PATTERN = re.compile(r'[A-Z]')
LOWERCASE_PATTERN = re.compile(r'[a-z]')
DIGIT_PATTERN = re.compile(r'\d')
SPECIAL_PATTERN = re.compile(r'[!@#$%^&*(),.?":{}|<>]')

COMMON_PASSWORDS = {
    "password", "password1", "12345678", "123456789", "qwerty123",
    "qwerty", "abc12345", "abc123456", "iloveyou", "admin123",
    "letmein1", "welcome1", "monkey123", "dragon123",
}


def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Пароль должен содержать минимум {MIN_PASSWORD_LENGTH} символов"
    if len(password) > MAX_PASSWORD_LENGTH:
        return False, f"Пароль не должен превышать {MAX_PASSWORD_LENGTH} символов"
    if REQUIRE_UPPERCASE and not UPPERCASE_PATTERN.search(password):
        return False, "Пароль должен содержать хотя бы одну заглавную букву"
    if REQUIRE_LOWERCASE and not LOWERCASE_PATTERN.search(password):
        return False, "Пароль должен содержать хотя бы одну строчную букву"
    if REQUIRE_DIGIT and not DIGIT_PATTERN.search(password):
        return False, "Пароль должен содержать хотя бы одну цифру"
    if REQUIRE_SPECIAL and not SPECIAL_PATTERN.search(password):
        return False, "Пароль должен содержать хотя бы один специальный символ"
    if password.lower() in COMMON_PASSWORDS:
        return False, "Пароль слишком простой"
    return True, None


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; "
            "script-src 'none'; "
            "frame-ancestors 'none';"
        )
        if ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response
