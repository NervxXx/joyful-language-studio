"""Brute-force protection for authentication endpoints.

Uses Redis if available, otherwise falls back to in-memory storage.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, Tuple
import logging
import os

logger = logging.getLogger(__name__)

try:
    import redis

    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    _redis_client = redis.from_url(
        REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=3,
    )
    _redis_client.ping()
    USE_REDIS = True
    logger.info("Auth protection: connected to Redis (%s)", REDIS_URL)
except Exception as e:
    _redis_client = None
    USE_REDIS = False
    logger.warning("Auth protection: Redis unavailable, using in-memory fallback: %s", e)


class AuthProtectionService:
    def __init__(
        self,
        max_attempts: int = 10,
        lockout_seconds: int = 15 * 60,
        attempts_window_seconds: int = 5 * 60,
    ) -> None:
        self.max_attempts = max_attempts
        self.lockout_seconds = lockout_seconds
        self.attempts_window_seconds = attempts_window_seconds
        self._attempts_memory: Dict[str, list[datetime]] = {}
        self._locks_memory: Dict[str, datetime] = {}

    def is_blocked(self, identifier: str) -> Tuple[bool, int]:
        if USE_REDIS and _redis_client is not None:
            return self._is_blocked_redis(identifier)
        return self._is_blocked_memory(identifier)

    def record_failed_attempt(self, identifier: str) -> Tuple[bool, int]:
        if USE_REDIS and _redis_client is not None:
            return self._record_failed_attempt_redis(identifier)
        return self._record_failed_attempt_memory(identifier)

    def clear_attempts(self, identifier: str) -> None:
        if USE_REDIS and _redis_client is not None:
            self._clear_attempts_redis(identifier)
        else:
            self._clear_attempts_memory(identifier)

    # --- Redis implementation ---

    def _blocked_key(self, identifier: str) -> str:
        return f"auth:lockout:{identifier}"

    def _attempts_key(self, identifier: str) -> str:
        return f"auth:attempts:{identifier}"

    def _is_blocked_redis(self, identifier: str) -> Tuple[bool, int]:
        assert _redis_client is not None
        ttl = _redis_client.ttl(self._blocked_key(identifier))
        if ttl and ttl > 0:
            return True, ttl
        return False, 0

    def _record_failed_attempt_redis(self, identifier: str) -> Tuple[bool, int]:
        assert _redis_client is not None
        attempts_key = self._attempts_key(identifier)
        lock_key = self._blocked_key(identifier)
        try:
            pipe = _redis_client.pipeline()
            pipe.incr(attempts_key)
            pipe.expire(attempts_key, self.attempts_window_seconds)
            attempts, _ = pipe.execute()
            if int(attempts) >= self.max_attempts:
                _redis_client.setex(lock_key, self.lockout_seconds, "1")
                logger.warning("Auth blocked %s for %ss after %s attempts", identifier, self.lockout_seconds, attempts)
                return True, self.lockout_seconds
            return False, 0
        except Exception as e:
            logger.error("Redis error in auth protection, falling back: %s", e)
            return self._record_failed_attempt_memory(identifier)

    def _clear_attempts_redis(self, identifier: str) -> None:
        assert _redis_client is not None
        try:
            _redis_client.delete(self._attempts_key(identifier))
            _redis_client.delete(self._blocked_key(identifier))
        except Exception as e:
            logger.error("Redis error clearing auth attempts: %s", e)

    # --- In-memory fallback ---

    def _is_blocked_memory(self, identifier: str) -> Tuple[bool, int]:
        now = datetime.utcnow()
        unlock_time = self._locks_memory.get(identifier)
        if unlock_time and unlock_time > now:
            return True, max(int((unlock_time - now).total_seconds()), 0)
        if unlock_time and unlock_time <= now:
            self._locks_memory.pop(identifier, None)
            self._attempts_memory.pop(identifier, None)
        return False, 0

    def _record_failed_attempt_memory(self, identifier: str) -> Tuple[bool, int]:
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.attempts_window_seconds)
        attempts = [ts for ts in self._attempts_memory.get(identifier, []) if ts > window_start]
        attempts.append(now)
        self._attempts_memory[identifier] = attempts
        if len(attempts) >= self.max_attempts:
            unlock_time = now + timedelta(seconds=self.lockout_seconds)
            self._locks_memory[identifier] = unlock_time
            remaining = int((unlock_time - now).total_seconds())
            logger.warning("Auth blocked (memory) %s for %ss after %s attempts", identifier, remaining, len(attempts))
            return True, remaining
        return False, 0

    def _clear_attempts_memory(self, identifier: str) -> None:
        self._attempts_memory.pop(identifier, None)
        self._locks_memory.pop(identifier, None)


auth_protection_service = AuthProtectionService()
