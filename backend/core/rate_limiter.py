"""Rate limiting middleware"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import status
import os

try:
    import redis
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    _redis = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=3)
    _redis.ping()
    USE_REDIS = True
except Exception:
    _redis = None
    USE_REDIS = False


def _get_client_ip(request: Request) -> str:
    """Get real client IP, respecting X-Forwarded-For from trusted proxies."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the leftmost (original client) IP
        ip = forwarded_for.split(",")[0].strip()
        if ip:
            return ip
    return request.client.host if request.client else "unknown"


class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)

    def is_allowed(self, client_id: str, max_requests: int, window_sec: int) -> Tuple[bool, int]:
        if USE_REDIS and _redis:
            key = f"rl:{client_id}"
            now = datetime.utcnow().timestamp()
            pipe = _redis.pipeline()
            pipe.zremrangebyscore(key, 0, now - window_sec)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window_sec + 60)
            _, _, count, _ = pipe.execute()
            if count > max_requests:
                return False, 0
            return True, max_requests - count

        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=window_sec)
        self.requests[client_id] = [t for t in self.requests[client_id] if t > cutoff]
        if len(self.requests[client_id]) >= max_requests:
            return False, 0
        self.requests[client_id].append(now)
        return True, max_requests - len(self.requests[client_id])


_limiter = RateLimiter()

# (max_requests, window_seconds)
RATE_LIMITS = {
    "/auth/login": (10, 60),                    # 10 attempts/min per IP
    "/auth/register": (5, 600),                  # 5 registrations/10min per IP
    "/auth/send-registration-code": (3, 300),    # 3 codes/5min per IP (email spam prevention)
    "/chat/send": (30, 60),                      # 30 messages/min per IP
    "/vocabulary/lookup": (20, 60),              # 20 lookups/min per IP
    "default": (120, 60),
}


def _get_limit(path: str) -> Tuple[int, int]:
    for p, limits in RATE_LIMITS.items():
        if p != "default" and path.startswith(p):
            return limits
    return RATE_LIMITS["default"]


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
        path = request.url.path
        max_r, window = _get_limit(path)
        client_id = _get_client_ip(request)
        ok, remaining = _limiter.is_allowed(client_id, max_r, window)
        if not ok:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": f"Превышен лимит запросов. Подождите {window} сек."},
                headers={"Retry-After": str(window)},
            )
        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
