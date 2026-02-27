"""API аутентификации"""
from datetime import timedelta, datetime
from typing import Optional
from secrets import token_urlsafe
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel

from core.database import get_session
from core.auth import (
    authenticate_user,
    create_user,
    create_access_token,
    update_user_last_login,
    get_password_hash,
    get_user_by_email,
    verify_password,
)
from core.dependencies import get_current_active_user
from core.user_utils import create_user_response
from models.user import UserCreate, UserResponse, UserUpdate, Token, User
from config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    COOKIE_SECURE,
    COOKIE_SAMESITE,
    GOOGLE_ALLOWED_CLIENT_IDS,
    GOOGLE_CLIENT_ID,
    EMAIL_VERIFICATION_REQUIRED,
)
from services.auth_protection_service import auth_protection_service
from services.verification_code_service import verification_code_service
from models.verification_code import SendCodeRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleAuthRequest(BaseModel):
    credential: str
    client_id: Optional[str] = None


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_session)):
    if EMAIL_VERIFICATION_REQUIRED:
        if not user_data.code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Требуется код подтверждения email")
        if not verification_code_service.verify_code(user_data.email, user_data.code):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный или просроченный код")
    user = create_user(db, user_data)
    return create_user_response(user)


@router.post("/send-registration-code")
def send_registration_code(req: SendCodeRequest, db: Session = Depends(get_session)):
    existing = get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь с таким email уже зарегистрирован")
    ok = verification_code_service.send_registration_code(req.email)
    if not ok:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Не удалось отправить код")
    return {"success": True, "message": "Код отправлен на email"}


@router.post("/login", response_model=Token)
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session),
):
    email = form_data.username
    client_ip = request.client.host if request.client else "unknown"

    email_blocked, email_retry = auth_protection_service.is_blocked(email)
    ip_blocked, ip_retry = auth_protection_service.is_blocked(client_ip)
    if email_blocked or ip_blocked:
        retry_after = max(email_retry, ip_retry)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Слишком много неудачных попыток. Повторите через {retry_after} сек.",
            headers={"Retry-After": str(retry_after)},
        )

    user = authenticate_user(db, email, form_data.password)
    if not user:
        auth_protection_service.record_failed_attempt(email)
        email_now, email_retry_now = auth_protection_service.record_failed_attempt(client_ip)
        if email_now:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Слишком много неудачных попыток. Повторите через {email_retry_now} сек.",
                headers={"Retry-After": str(email_retry_now)},
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_protection_service.clear_attempts(email)
    auth_protection_service.clear_attempts(client_ip)
    update_user_last_login(db, user)

    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=create_user_response(user),
    )


@router.post("/google", response_model=Token)
def login_with_google(
    payload: GoogleAuthRequest,
    response: Response,
    db: Session = Depends(get_session),
):
    """Login or register via Google ID Token."""
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    if not GOOGLE_ALLOWED_CLIENT_IDS:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication is not configured",
        )

    audience = payload.client_id or GOOGLE_CLIENT_ID or GOOGLE_ALLOWED_CLIENT_IDS[0]
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication is not configured",
        )

    try:
        id_info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            audience=audience,
            clock_skew_in_seconds=60,
        )
    except ValueError as exc:
        logger.error("Invalid Google token: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid Google token: {exc}")

    aud = id_info.get("aud")
    if GOOGLE_ALLOWED_CLIENT_IDS and aud not in GOOGLE_ALLOWED_CLIENT_IDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google client is not allowed")

    google_sub = id_info.get("sub")
    email = id_info.get("email")
    email_verified = id_info.get("email_verified", False)
    full_name = id_info.get("name")
    avatar_url = id_info.get("picture")
    if isinstance(avatar_url, str):
        avatar_url = avatar_url.strip() or None

    if not google_sub:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google response missing user id")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google response missing email")
    if not email_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google email is not verified")

    user = db.exec(select(User).where(User.google_id == google_sub)).first()
    if not user:
        user = get_user_by_email(db, email)

    if user:
        updated = False
        if getattr(user, "google_id", None) != google_sub:
            user.google_id = google_sub
            updated = True
        if getattr(user, "auth_provider", "local") != "google":
            user.auth_provider = "google"
            updated = True
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
            updated = True
        if full_name and not user.full_name:
            user.full_name = full_name
            updated = True
        if updated:
            user.updated_at = datetime.utcnow()
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        random_password = token_urlsafe(16)
        user_create = UserCreate(
            email=email,
            password=random_password,
            full_name=full_name,
        )
        user = create_user(db, user_create)
        user.google_id = google_sub
        user.auth_provider = "google"
        if avatar_url:
            user.avatar_url = avatar_url
        user.updated_at = datetime.utcnow()
        db.add(user)
        db.commit()
        db.refresh(user)

    update_user_last_login(db, user)

    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=create_user_response(user),
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return create_user_response(current_user)


@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.daily_goal_minutes is not None:
        current_user.daily_goal_minutes = user_update.daily_goal_minutes
    if user_update.notifications_enabled is not None:
        current_user.notifications_enabled = user_update.notifications_enabled
    if user_update.sound_enabled is not None:
        current_user.sound_enabled = user_update.sound_enabled
    if user_update.password is not None:
        from core.security import validate_password_strength
        ok, err = validate_password_strength(user_update.password)
        if not ok:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)
        current_user.hashed_password = get_password_hash(user_update.password)
    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return create_user_response(current_user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE)
    return {"message": "Выход выполнен"}


@router.get("/me/export")
def export_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    """Экспорт данных пользователя в JSON."""
    from models.conversation import Conversation
    from models.message import Message
    from models.vocabulary_word import VocabularyWord

    convs = list(
        db.exec(
            select(Conversation).where(Conversation.user_id == current_user.id).order_by(Conversation.created_at.desc())
        ).all()
    )
    words = list(
        db.exec(
            select(VocabularyWord).where(
                (VocabularyWord.user_id == current_user.id) | (VocabularyWord.user_id.is_(None))
            )
        ).all()
    )

    def conv_to_dict(c):
        msgs = list(db.exec(select(Message).where(Message.conversation_id == c.id).order_by(Message.created_at)).all())
        return {
            "id": c.id,
            "title": c.title,
            "coach_type": c.coach_type,
            "context": c.context,
            "created_at": c.created_at.isoformat(),
            "messages": [
                {"content": m.content, "is_from_user": m.is_from_user, "created_at": m.created_at.isoformat()}
                for m in msgs
            ],
        }

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
        },
        "vocabulary": [{"word_en": w.word_en, "word_ru": w.word_ru, "phonetic": w.phonetic} for w in words],
        "conversations": [conv_to_dict(c) for c in convs],
        "exported_at": datetime.utcnow().isoformat(),
    }


@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    """Удаление аккаунта и всех данных пользователя."""
    from models.conversation import Conversation
    from models.message import Message
    from models.vocabulary_word import VocabularyWord

    for msg in db.exec(select(Message).where(Message.conversation_id.in_(select(Conversation.id).where(Conversation.user_id == current_user.id)))).all():
        db.delete(msg)
    for conv in db.exec(select(Conversation).where(Conversation.user_id == current_user.id)).all():
        db.delete(conv)
    for w in db.exec(select(VocabularyWord).where(VocabularyWord.user_id == current_user.id)).all():
        db.delete(w)
    db.delete(current_user)
    db.commit()
    resp = JSONResponse(content={"ok": True, "message": "Аккаунт удалён"})
    resp.delete_cookie("access_token", path="/", secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE)
    return resp
