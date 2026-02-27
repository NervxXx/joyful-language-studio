"""Модель кодов верификации email"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class VerificationCode(SQLModel, table=True):
    __tablename__ = "verification_codes"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(..., index=True)
    code: str
    expires_at: datetime
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_at: Optional[datetime] = Field(default=None)


class VerifyCodeRequest(SQLModel):
    email: str
    code: str


class SendCodeRequest(SQLModel):
    email: str
