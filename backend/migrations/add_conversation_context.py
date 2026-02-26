"""Миграция: добавить колонку context в conversation"""
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

from sqlalchemy import text
from core.database import engine


def up():
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE conversation ADD COLUMN IF NOT EXISTS context TEXT"))
    print("Migration add_conversation_context: done")


if __name__ == "__main__":
    up()
