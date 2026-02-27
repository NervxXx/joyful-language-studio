"""Сервис бесед"""
from typing import List, Optional
from sqlmodel import Session, select

from models.conversation import Conversation
from models.message import Message


class ConversationService:
    def create_conversation(
        self,
        user_id: int,
        title: str = "New Chat",
        avatar: str | None = None,
        coach_type: str = "friendly",
        context: str | None = None,
        explain_lang: str = "ru",
    ) -> Conversation:
        conv = Conversation(
            user_id=user_id,
            title=title,
            avatar=(avatar[:10] if avatar else None),
            coach_type=coach_type,
            context=context,
            explain_lang=explain_lang or "ru",
        )
        return conv

    def get_conversation(self, session: Session, conversation_id: int) -> Optional[Conversation]:
        return session.get(Conversation, conversation_id)

    def get_conversations(
        self,
        session: Session,
        user_id: int,
        offset: int = 0,
        limit: int = 50,
    ) -> List[Conversation]:
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(session.exec(stmt).all())

    def update_conversation(
        self,
        session: Session,
        conversation_id: int,
        *,
        title: str | None = None,
        avatar: str | None = None,
        is_pinned: bool | None = None,
        coach_type: str | None = None,
        context: str | None = None,
        explain_lang: str | None = None,
    ) -> Optional[Conversation]:
        conv = session.get(Conversation, conversation_id)
        if not conv:
            return None
        if title is not None:
            conv.title = title[:200] if title else "New Chat"
        if avatar is not None:
            conv.avatar = avatar[:10] if avatar else None
        if is_pinned is not None:
            conv.is_pinned = is_pinned
        if coach_type is not None:
            conv.coach_type = coach_type[:20] if coach_type else "friendly"
        if context is not None:
            conv.context = context
        if explain_lang is not None:
            conv.explain_lang = explain_lang if explain_lang in ("ru", "en") else "ru"
        from datetime import datetime
        conv.updated_at = datetime.utcnow()
        session.add(conv)
        session.commit()
        session.refresh(conv)
        return conv

    def save_message(
        self,
        session: Session,
        conversation_id: int,
        content: str,
        is_from_user: bool,
        correction_wrong: Optional[str] = None,
        correction_right: Optional[str] = None,
        correction_reason: Optional[str] = None,
    ) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            content=content,
            is_from_user=is_from_user,
            correction_wrong=correction_wrong,
            correction_right=correction_right,
            correction_reason=correction_reason,
        )
        session.add(msg)
        session.commit()
        session.refresh(msg)

        conv = session.get(Conversation, conversation_id)
        if conv:
            from datetime import datetime
            conv.updated_at = datetime.utcnow()
            session.add(conv)
            session.commit()

        return msg

    def get_messages(
        self,
        session: Session,
        conversation_id: int,
        offset: int = 0,
        limit: int = 100,
    ) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        return list(session.exec(stmt).all())

    def delete_conversation(self, session: Session, conversation_id: int) -> bool:
        conv = session.get(Conversation, conversation_id)
        if not conv:
            return False
        for msg in session.exec(select(Message).where(Message.conversation_id == conversation_id)).all():
            session.delete(msg)
        session.delete(conv)
        session.commit()
        return True
