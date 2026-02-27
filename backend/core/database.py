"""Настройка базы данных PostgreSQL"""
import os
import logging
from sqlmodel import Session, SQLModel, create_engine

from models.user import User
from models.conversation import Conversation
from models.message import Message
from models.vocabulary_word import VocabularyWord, VocabularySet
from models.verification_code import VerificationCode

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL не установлен в переменных окружения")

if not (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")):
    raise ValueError("DATABASE_URL должна указывать на PostgreSQL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
    echo=False,
)


def create_db_and_tables():
    """Создать таблицы в базе данных"""
    SQLModel.metadata.create_all(engine)
    _migrate_add_is_pinned()
    _migrate_add_is_active_vocabulary()
    _migrate_add_vocabulary_sort_order()
    _migrate_add_explain_lang()
    _migrate_add_avatar()
    logger.info("Таблицы базы данных созданы")


def _migrate_add_is_pinned():
    """Добавить колонку is_pinned если её нет (миграция)"""
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE conversation ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE"))
    except Exception as e:
        logger.warning("Миграция is_pinned: %s", e)


def _migrate_add_is_active_vocabulary():
    """Добавить колонку is_active в vocabularyword (миграция)"""
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE vocabularyword ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"))
    except Exception as e:
        logger.warning("Миграция vocabularyword.is_active: %s", e)


def _migrate_add_vocabulary_sort_order():
    """Добавить колонку sort_order в vocabularyword (миграция)"""
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE vocabularyword ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0"))
    except Exception as e:
        logger.warning("Миграция vocabularyword.sort_order: %s", e)


def _migrate_add_explain_lang():
    """Добавить колонку explain_lang в conversation (миграция)"""
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE conversation ADD COLUMN IF NOT EXISTS explain_lang VARCHAR(5) DEFAULT 'ru'"))
    except Exception as e:
        logger.warning("Миграция conversation.explain_lang: %s", e)


def _migrate_add_avatar():
    """Добавить колонку avatar в conversation (миграция)"""
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE conversation ADD COLUMN IF NOT EXISTS avatar VARCHAR(10)"))
    except Exception as e:
        logger.warning("Миграция conversation.avatar: %s", e)


def get_session():
    from typing import Generator
    with Session(engine) as session:
        yield session
