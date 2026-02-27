"""Аутентификация"""
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlmodel import Session, select

from models.user import User, TokenData
from core.security import validate_password_strength
from config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES

ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if username is None or user_id is None:
            raise credentials_exception
        return TokenData(username=username, user_id=user_id)
    except JWTError:
        raise credentials_exception


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.exec(select(User).where(User.username == username)).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.exec(select(User).where(User.email == email)).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def authenticate_user(db: Session, email: str, password: str) -> Union[User, bool]:
    user = get_user_by_email(db, email)
    if not user:
        dummy_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5"
        verify_password(password, dummy_hash)
        import time
        time.sleep(0.01)
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def _normalize_username(value: str) -> str:
    import re
    username = (value or "").strip().lower()
    return re.sub(r"[^a-z0-9._-]", "", username)


def _generate_username_from_email(email: str) -> str:
    import uuid
    base = _normalize_username(email.split("@")[0])[:30]
    if not base or len(base) < 3:
        base = f"user{uuid.uuid4().hex[:6]}"
    return base


def create_user(db: Session, user_create) -> User:
    is_valid, error_message = validate_password_strength(user_create.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_message or "Пароль не соответствует требованиям")

    if get_user_by_email(db, user_create.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь с таким email уже существует")

    username_input = getattr(user_create, "username", None)
    username = _normalize_username(username_input) if username_input else _generate_username_from_email(user_create.email)

    original_username = username
    suffix = 1
    while get_user_by_username(db, username):
        username = f"{original_username[:25]}{suffix}"
        suffix += 1
        if suffix > 999:
            import uuid
            username = f"user{uuid.uuid4().hex[:6]}"
            suffix = 1

    hashed_password = get_password_hash(user_create.password)
    db_user = User(
        username=username,
        email=user_create.email,
        full_name=user_create.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=False,
        auth_provider="local",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_last_login(db: Session, user: User):
    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
