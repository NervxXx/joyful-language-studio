"""Модель беседы (чат с AI Coach)"""
from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship


class ConversationBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(default="New Chat", max_length=200)
    avatar: Optional[str] = Field(default=None, max_length=10)  # emoji or icon key
    coach_type: str = Field(default="friendly", max_length=20)  # friendly | strict | calm
    context: Optional[str] = Field(default=None)  # пользовательский контекст (уровень, роль, ситуация и т.д.)
    explain_lang: Optional[str] = Field(default="ru", max_length=5)  # ru | en — язык объяснений и исправлений


class Conversation(ConversationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_pinned: bool = Field(default=False)

    messages: List["Message"] = Relationship(back_populates="conversation")


class ConversationPublic(SQLModel):
    id: int
    user_id: int
    title: str
    coach_type: str
    created_at: datetime
    updated_at: datetime
