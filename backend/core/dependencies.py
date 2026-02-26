"""FastAPI зависимости"""
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from core.database import get_session
from core.auth import verify_token, get_user_by_id
from models.user import User

security = HTTPBearer(auto_error=False)


def _extract_token_from_request(request: Request, credentials) -> str | None:
    if credentials and credentials.credentials:
        return credentials.credentials
    return request.cookies.get("access_token")


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_session),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = _extract_token_from_request(request, credentials)
    if not token:
        raise credentials_exception
    token_data = verify_token(token, credentials_exception)
    user = get_user_by_id(db, token_data.user_id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь деактивирован")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def get_optional_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_session),
) -> User | None:
    try:
        token = _extract_token_from_request(request, credentials)
        if not token:
            return None
        exc = HTTPException(status_code=401, detail="Invalid token")
        token_data = verify_token(token, exc)
        user = get_user_by_id(db, token_data.user_id)
        if user is None or not user.is_active:
            return None
        return user
    except Exception:
        return None
