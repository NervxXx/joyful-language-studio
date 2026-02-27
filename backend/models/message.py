"""Модель сообщения"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from pydantic import BaseModel


class MessageBase(SQLModel):
    content: str
    is_from_user: bool = Field(default=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    correction_wrong: Optional[str] = Field(default=None)
    correction_right: Optional[str] = Field(default=None)
    correction_reason: Optional[str] = Field(default=None)


class Message(MessageBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Optional["Conversation"] = Relationship(back_populates="messages")


class MessagePublic(SQLModel):
    id: int
    content: str
    is_from_user: bool
    conversation_id: int
    correction_wrong: Optional[str] = None
    correction_right: Optional[str] = None
    correction_reason: Optional[str] = None
    created_at: datetime


class ChatSendRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    coach_type: Optional[str] = "friendly"
    title: Optional[str] = None
    voice_mode: Optional[bool] = False
    explain_lang: Optional[str] = None
    extra_context: Optional[str] = None
    vocab_words: Optional[list[str]] = None
