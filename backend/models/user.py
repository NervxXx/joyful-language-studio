"""Модель пользователя"""
from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)
    auth_provider: str = Field(default="local")


class UserCreate(SQLModel):
    email: str = Field(..., max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    code: Optional[str] = Field(default=None, max_length=6)


class UserUpdate(SQLModel):
    full_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = Field(default=None)
    password: Optional[str] = Field(default=None, min_length=6, max_length=100)
    daily_goal_minutes: Optional[int] = Field(default=None, ge=1, le=180)
    notifications_enabled: Optional[bool] = None
    sound_enabled: Optional[bool] = None


class User(UserBase, table=True):
    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(..., unique=True, index=True, min_length=3, max_length=50)
    email: str = Field(..., unique=True, index=True)
    full_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)
    hashed_password: str = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    last_login: Optional[datetime] = Field(default=None)
    auth_provider: str = Field(default="local")
    google_id: Optional[str] = Field(default=None, unique=True)
    daily_goal_minutes: int = Field(default=20, ge=1, le=180)
    notifications_enabled: bool = Field(default=True)
    sound_enabled: bool = Field(default=True)


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    daily_goal_minutes: int = 20
    notifications_enabled: bool = True
    sound_enabled: bool = True


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenData(SQLModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
