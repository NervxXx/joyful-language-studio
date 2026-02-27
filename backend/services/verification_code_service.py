"""Verification code service for email confirmation during registration."""

import random
import string
from datetime import datetime, timedelta
from typing import Optional
import logging

from sqlmodel import Session, select
from core.database import engine
from models.verification_code import VerificationCode
from services.email_service import email_service

logger = logging.getLogger(__name__)


class VerificationCodeService:
    def _get_session(self):
        return Session(engine)

    def _generate_code(self) -> str:
        return "".join(random.choices(string.digits, k=6))

    def send_registration_code(self, email: str) -> bool:
        try:
            code = self._generate_code()
            self._cleanup(email)
            expires_at = datetime.utcnow() + timedelta(minutes=15)

            record = VerificationCode(email=email, code=code, expires_at=expires_at)
            with self._get_session() as session:
                session.add(record)
                session.commit()

            subject = "LinguaAI — Код подтверждения"
            body = (
                f"Ваш код подтверждения: {code}\n\n"
                "Введите этот код для завершения регистрации.\n"
                "Код действителен 15 минут.\n\n"
                "Если вы не регистрировались, проигнорируйте это письмо."
            )
            ok = email_service.send_email(subject, body, email)
            if ok:
                logger.info("Registration code sent to %s", email)
            else:
                logger.error("Failed to send registration code to %s", email)
            return ok
        except Exception as e:
            logger.error("Error sending registration code to %s: %s", email, e)
            return False

    def verify_code(self, email: str, code: str) -> bool:
        try:
            with self._get_session() as session:
                record = session.exec(
                    select(VerificationCode).where(
                        VerificationCode.email == email,
                        VerificationCode.code == code,
                        VerificationCode.is_used == False,
                        VerificationCode.expires_at > datetime.utcnow(),
                    )
                ).first()
                if not record:
                    return False
                record.is_used = True
                record.used_at = datetime.utcnow()
                session.add(record)
                session.commit()
                return True
        except Exception as e:
            logger.error("Error verifying code for %s: %s", email, e)
            return False

    def _cleanup(self, email: Optional[str] = None):
        try:
            with self._get_session() as session:
                stmt = select(VerificationCode)
                if email:
                    stmt = stmt.where(VerificationCode.email == email)
                now = datetime.utcnow()
                for record in session.exec(stmt).all():
                    if record.is_used or record.expires_at < now:
                        session.delete(record)
                session.commit()
        except Exception as e:
            logger.error("Error cleaning up codes: %s", e)


verification_code_service = VerificationCodeService()
