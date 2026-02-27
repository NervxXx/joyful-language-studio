"""API словарного запаса"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlmodel import Session, select
from pydantic import BaseModel

from core.database import get_session
from core.dependencies import get_current_active_user, get_optional_current_user
from models.user import User
from models.vocabulary_word import VocabularyWord, VocabularySet, VocabularyWordPublic, VocabularyWordCreate
from services.langchain_service import LangChainService

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])
llm_service = LangChainService()


class LookupRequest(BaseModel):
    word: str


@router.post("/lookup")
async def lookup_word(
    body: LookupRequest,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_session),
):
    """Получить перевод, транскрипцию и примеры. Сначала проверка БД, затем LLM."""
    word = (body.word or "").strip()[:200]
    if not word:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Слово не указано")

    stmt = select(VocabularyWord).where(
        (func.lower(VocabularyWord.word_en) == word.lower()) | (func.lower(VocabularyWord.word_ru) == word.lower())
    )
    if current_user:
        stmt = stmt.where((VocabularyWord.user_id == current_user.id) | (VocabularyWord.user_id.is_(None)))
    else:
        stmt = stmt.where(VocabularyWord.user_id.is_(None))
    existing = db.exec(stmt).first()
    if existing:
        return {
            "word_en": existing.word_en,
            "word_ru": existing.word_ru,
            "phonetic": existing.phonetic,
            "examples": existing.example,
        }

    try:
        result = await llm_service.lookup_word(word)
        return result
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Сервис временно недоступен")


@router.get("/words")
def list_words(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
    set_id: Optional[int] = None,
    active_only: Optional[bool] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    stmt = select(VocabularyWord).where(
        (VocabularyWord.user_id == current_user.id) | (VocabularyWord.user_id.is_(None))
    )
    if set_id is not None:
        stmt = stmt.where(VocabularyWord.set_id == set_id)
    if active_only is not None:
        stmt = stmt.where(VocabularyWord.is_active == active_only)
    stmt = stmt.order_by(VocabularyWord.sort_order.asc(), VocabularyWord.created_at.asc()).offset(offset).limit(limit)
    words = list(db.exec(stmt).all())
    return [
        {
            "id": w.id,
            "word_en": w.word_en,
            "word_ru": w.word_ru,
            "set_id": w.set_id,
            "phonetic": w.phonetic,
            "example": w.example,
            "created_at": w.created_at.isoformat(),
            "is_active": getattr(w, "is_active", True),
            "sort_order": getattr(w, "sort_order", 0),
        }
        for w in words
    ]


@router.post("/words", status_code=status.HTTP_201_CREATED)
def add_word(
    body: VocabularyWordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    own_words = list(
        db.exec(
            select(VocabularyWord).where(
                VocabularyWord.user_id == current_user.id,
                VocabularyWord.is_active == getattr(body, "is_active", True),
            )
        ).all()
    )
    next_order = (max([getattr(x, "sort_order", 0) for x in own_words], default=-1) + 1)
    w = VocabularyWord(
        word_en=body.word_en.strip(),
        word_ru=body.word_ru.strip(),
        set_id=body.set_id,
        user_id=current_user.id,
        phonetic=body.phonetic,
        example=body.example,
        is_active=getattr(body, "is_active", True),
        sort_order=body.sort_order if body.sort_order is not None else next_order,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return {
        "id": w.id,
        "word_en": w.word_en,
        "word_ru": w.word_ru,
        "set_id": w.set_id,
        "created_at": w.created_at.isoformat(),
    }


class VocabularyWordUpdate(BaseModel):
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class VocabularyReorderItem(BaseModel):
    id: int
    is_active: bool
    sort_order: int


class VocabularyReorderRequest(BaseModel):
    items: List[VocabularyReorderItem]


@router.patch("/words/reorder")
def reorder_words(
    body: VocabularyReorderRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    if not body.items:
        return {"ok": True}
    if len(body.items) > 500:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Слишком много элементов")
    ids = [item.id for item in body.items]
    words = list(
        db.exec(
            select(VocabularyWord).where(
                VocabularyWord.id.in_(ids),
                VocabularyWord.user_id == current_user.id,
            )
        ).all()
    )
    by_id = {w.id: w for w in words}
    for item in body.items:
        w = by_id.get(item.id)
        if not w:
            continue
        w.is_active = item.is_active
        w.sort_order = item.sort_order
        db.add(w)
    db.commit()
    return {"ok": True}


@router.patch("/words/{word_id}")
def update_word(
    word_id: int,
    body: VocabularyWordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    w = db.get(VocabularyWord, word_id)
    if not w:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Слово не найдено")
    # Global words (user_id=None) are read-only for regular users
    if w.user_id is None or w.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")
    if body.is_active is not None:
        w.is_active = body.is_active
    if body.sort_order is not None:
        w.sort_order = body.sort_order
    if body.is_active is not None or body.sort_order is not None:
        db.add(w)
        db.commit()
        db.refresh(w)
    return {
        "id": w.id,
        "word_en": w.word_en,
        "word_ru": w.word_ru,
        "is_active": getattr(w, "is_active", True),
        "sort_order": getattr(w, "sort_order", 0),
    }


@router.delete("/words/{word_id}")
def delete_word(
    word_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    w = db.get(VocabularyWord, word_id)
    if not w:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Слово не найдено")
    # Global words (user_id=None) are read-only for regular users
    if w.user_id is None or w.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")
    db.delete(w)
    db.commit()
    return {"ok": True}


@router.get("/sets")
def list_sets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    stmt = select(VocabularySet).where(
        (VocabularySet.user_id == current_user.id) | (VocabularySet.user_id.is_(None))
    )
    sets = list(db.exec(stmt).all())
    return [
        {"id": s.id, "name": s.name, "description": s.description, "created_at": s.created_at.isoformat()}
        for s in sets
    ]
