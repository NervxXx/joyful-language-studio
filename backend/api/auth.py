"""API аутентификации"""
from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

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
from config import ACCESS_TOKEN_EXPIRE_MINUTES, COOKIE_SECURE, COOKIE_SAMESITE

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_session)):
    user = create_user(db, user_data)
    return create_user_response(user)


@router.post("/login", response_model=Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session),
):
    email = form_data.username
    user = authenticate_user(db, email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
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
    from sqlmodel import select

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
    from sqlmodel import select

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
