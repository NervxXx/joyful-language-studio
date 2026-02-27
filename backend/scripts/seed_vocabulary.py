"""Скрипт для добавления начальных слов в словарь (user_id=None — глобальные)"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent.parent / ".env")

from sqlmodel import Session, select
from core.database import engine, create_db_and_tables
from models.vocabulary_word import VocabularyWord

DEFAULT_WORDS = [
    ("appetizer", "закуска"),
    ("main course", "основное блюдо"),
    ("dessert", "десерт"),
    ("bill", "счёт"),
    ("waiter", "официант"),
    ("menu", "меню"),
    ("tip", "чаевые"),
    ("reservation", "бронирование"),
]

def main():
    create_db_and_tables()
    with Session(engine) as session:
        for en, ru in DEFAULT_WORDS:
            existing = session.exec(
                select(VocabularyWord).where(VocabularyWord.word_en == en, VocabularyWord.user_id.is_(None))
            ).first()
            if not existing:
                w = VocabularyWord(word_en=en, word_ru=ru, user_id=None)
                session.add(w)
        session.commit()
    print("Seed done: added default vocabulary words")

if __name__ == "__main__":
    main()
