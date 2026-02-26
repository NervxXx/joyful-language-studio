"""API чата с AI Coach"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from pydantic import BaseModel
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_active_user
from models.user import User
from models.message import MessagePublic, ChatSendRequest
from services.conversation_service import ConversationService
from services.langchain_service import LangChainService

router = APIRouter(tags=["chat"])
conv_service = ConversationService()
llm_service = LangChainService()


class CreateChatRequest(BaseModel):
    title: str = "New Chat"
    avatar: Optional[str] = None
    coach_type: str = "friendly"
    context: Optional[str] = None
    explain_lang: Optional[str] = "ru"


@router.post("/chat/new")
def create_chat(
    body: CreateChatRequest = Body(),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    explain_lang = (body.explain_lang or "ru").strip().lower()
    if explain_lang not in ("ru", "en"):
        explain_lang = "ru"
    conv = conv_service.create_conversation(
        current_user.id,
        title=body.title,
        avatar=body.avatar,
        coach_type=body.coach_type,
        context=body.context,
        explain_lang=explain_lang,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {
        "id": conv.id,
        "conversation_id": conv.id,
        "title": conv.title,
        "avatar": getattr(conv, "avatar", None),
        "coach_type": conv.coach_type,
        "created_at": conv.created_at.isoformat(),
    }


@router.post("/chat/send")
async def send_message(
    body: ChatSendRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    content = (body.message or "").strip()
    if len(content) < 1 or len(content) > 5000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сообщение должно быть от 1 до 5000 символов")

    conv_id = body.conversation_id
    new_title = (body.title or "").strip() or "New Chat"

    if conv_id:
        conv_obj = conv_service.get_conversation(db, conv_id)
        if not conv_obj or conv_obj.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Беседа не найдена")
    else:
        coach_init = body.coach_type or "friendly"
        conv_obj = conv_service.create_conversation(current_user.id, title=new_title, coach_type=coach_init)
        db.add(conv_obj)
        db.commit()
        db.refresh(conv_obj)
        conv_id = conv_obj.id
    coach_type = body.coach_type or (conv_obj.coach_type if conv_obj else "friendly") or "friendly"

    user_msg = conv_service.save_message(db, conv_id, content, is_from_user=True)
    history = [
        {"content": m.content, "is_from_user": m.is_from_user}
        for m in conv_service.get_messages(db, conv_id, limit=20)
    ]
    history = [h for h in history if h["content"]]  # exclude just-saved
    context = conv_obj.context if conv_obj else None
    if body.extra_context and body.extra_context.strip():
        context = (context or "") + ("\n" if context else "") + body.extra_context.strip()
    voice_mode = body.voice_mode or False
    explain_lang = (body.explain_lang or "").strip().lower() or None
    if explain_lang and explain_lang not in ("ru", "en"):
        explain_lang = "ru"
    if explain_lang is None and conv_obj:
        explain_lang = getattr(conv_obj, "explain_lang", None) or "ru"
    try:
        ai_resp = await llm_service.generate_coach_response(
            content,
            str(conv_id),
            history,
            coach_type=coach_type,
            context=context,
            voice_mode=voice_mode,
            explain_lang=explain_lang,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Ошибка AI: {str(e)}")

    agent_text = ai_resp.get("text", "Извините, не удалось сгенерировать ответ.")
    correction = ai_resp.get("correction") or {}
    cw = correction.get("wrong") if isinstance(correction, dict) else None
    cr = correction.get("right") if isinstance(correction, dict) else None
    cre = correction.get("reason") if isinstance(correction, dict) else None

    agent_msg = conv_service.save_message(
        db,
        conv_id,
        agent_text,
        is_from_user=False,
        correction_wrong=cw,
        correction_right=cr,
        correction_reason=cre,
    )

    return {
        "conversation_id": conv_id,
        "user_message": content,
        "agent_response": agent_text,
        "message_id": agent_msg.id,
        "correction": correction if isinstance(correction, dict) and any(correction.values()) else None,
    }


@router.get("/conversations/")
def list_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    convs = conv_service.get_conversations(db, current_user.id, offset, limit)
    return [
        {
            "id": c.id,
            "title": c.title,
            "avatar": getattr(c, "avatar", None),
            "coach_type": c.coach_type,
            "explain_lang": getattr(c, "explain_lang", None) or "ru",
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
            "is_pinned": getattr(c, "is_pinned", False),
        }
        for c in convs
    ]


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    conv = conv_service.get_conversation(db, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Беседа не найдена")
    return {
        "id": conv.id,
        "title": conv.title,
        "avatar": getattr(conv, "avatar", None),
        "coach_type": conv.coach_type,
        "context": conv.context,
        "explain_lang": getattr(conv, "explain_lang", None) or "ru",
        "created_at": conv.created_at.isoformat(),
        "updated_at": conv.updated_at.isoformat(),
        "is_pinned": getattr(conv, "is_pinned", False),
    }


class UpdateConversationRequest(BaseModel):
    title: Optional[str] = None
    avatar: Optional[str] = None
    is_pinned: Optional[bool] = None
    coach_type: Optional[str] = None
    context: Optional[str] = None
    explain_lang: Optional[str] = None


@router.patch("/conversations/{conversation_id}")
def update_conversation(
    conversation_id: int,
    body: UpdateConversationRequest = Body(),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    conv = conv_service.get_conversation(db, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Беседа не найдена")
    if all(
        getattr(body, k) is None
        for k in ("title", "avatar", "is_pinned", "coach_type", "context", "explain_lang")
    ):
        return {
            "id": conv.id,
            "title": conv.title,
            "avatar": getattr(conv, "avatar", None),
            "is_pinned": getattr(conv, "is_pinned", False),
            "coach_type": conv.coach_type,
            "explain_lang": getattr(conv, "explain_lang", None) or "ru",
        }
    explain_lang = body.explain_lang
    if explain_lang is not None:
        explain_lang = (explain_lang or "ru").strip().lower()
        if explain_lang not in ("ru", "en"):
            explain_lang = "ru"
    updated = conv_service.update_conversation(
        db,
        conversation_id,
        title=body.title,
        avatar=body.avatar,
        is_pinned=body.is_pinned,
        coach_type=body.coach_type,
        context=body.context,
        explain_lang=explain_lang,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Беседа не найдена")
    return {
        "id": updated.id,
        "title": updated.title,
        "is_pinned": getattr(updated, "is_pinned", False),
        "coach_type": updated.coach_type,
        "explain_lang": getattr(updated, "explain_lang", None) or "ru",
        "updated_at": updated.updated_at.isoformat(),
    }


@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    conv = conv_service.get_conversation(db, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Беседа не найдена")
    msgs = conv_service.get_messages(db, conversation_id, offset, limit)
    return [
        {
            "id": m.id,
            "content": m.content,
            "is_from_user": m.is_from_user,
            "correction_wrong": m.correction_wrong,
            "correction_right": m.correction_right,
            "correction_reason": m.correction_reason,
            "created_at": m.created_at.isoformat(),
        }
        for m in msgs
    ]


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    conv = conv_service.get_conversation(db, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Беседа не найдена")
    conv_service.delete_conversation(db, conversation_id)
    return {"ok": True}
