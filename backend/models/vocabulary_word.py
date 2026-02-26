"""Модели словарного запаса"""
from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship


class VocabularyWordBase(SQLModel):
    word_en: str = Field(..., max_length=200)
    word_ru: str = Field(..., max_length=200)
    set_id: Optional[int] = Field(default=None, foreign_key="vocabularyset.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    phonetic: Optional[str] = Field(default=None, max_length=100)
    example: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)


class VocabularyWord(VocabularyWordBase, table=True):
    __tablename__ = "vocabularyword"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)  # True = активный (для практики), False = пассивный
    sort_order: int = Field(default=0)  # Порядок внутри активного/пассивного словаря


class VocabularySetBase(SQLModel):
    name: str = Field(..., max_length=100)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    description: Optional[str] = Field(default=None)


class VocabularySet(VocabularySetBase, table=True):
    __tablename__ = "vocabularyset"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class VocabularyWordPublic(SQLModel):
    id: int
    word_en: str
    word_ru: str
    set_id: Optional[int] = None
    phonetic: Optional[str] = None
    example: Optional[str] = None
    created_at: datetime


class VocabularyWordCreate(SQLModel):
    word_en: str = Field(..., max_length=200)
    word_ru: str = Field(..., max_length=200)
    set_id: Optional[int] = None
    phonetic: Optional[str] = None
    example: Optional[str] = None
    is_active: bool = True
    sort_order: Optional[int] = None
