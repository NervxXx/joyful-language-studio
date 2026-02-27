"""Миграция: добавить колонки настроек пользователя"""
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
        conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS daily_goal_minutes INTEGER DEFAULT 20"))
        conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE"))
        conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT TRUE"))
    print("Migration add_user_preferences: done")


if __name__ == "__main__":
    up()
