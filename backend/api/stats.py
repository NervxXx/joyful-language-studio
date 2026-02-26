"""API статистики для главной страницы"""
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, Header
from sqlmodel import Session, select, func

from core.database import get_session
from core.dependencies import get_optional_current_user
from models.user import User
from models.vocabulary_word import VocabularyWord
from models.conversation import Conversation
from models.message import Message

router = APIRouter(prefix="/stats", tags=["stats"])


def _get_day_bounds_utc(d: date, tz_name: str) -> tuple[datetime, datetime]:
    """Получить начало и конец дня d в часовом поясе пользователя, вернуть как UTC naive для запросов."""
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("UTC")
    start_local = datetime.combine(d, datetime.min.time(), tzinfo=tz)
    end_local = datetime.combine(d, datetime.max.time(), tzinfo=tz)
    start_utc = start_local.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
    end_utc = end_local.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
    return start_utc, end_utc


def _compute_streak(db: Session, user_id: int, tz_name: str = "UTC") -> int:
    """Подсчёт серии дней подряд с активностью (обновление беседы или сообщение в диалоге). Учитывает часовой пояс."""
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("UTC")
    today = datetime.now(tz).date()
    streak = 0
    d = today
    conv_ids = None

    while True:
        start_utc, end_utc = _get_day_bounds_utc(d, tz_name)
        has_conv = db.exec(
            select(Conversation).where(
                Conversation.user_id == user_id,
                Conversation.updated_at >= start_utc,
                Conversation.updated_at <= end_utc,
            ).limit(1)
        ).first()
        if has_conv:
            streak += 1
            d -= timedelta(days=1)
            continue
        if conv_ids is None:
            conv_ids = [r for r in db.exec(select(Conversation.id).where(Conversation.user_id == user_id)).all()]
        has_msg = None
        if conv_ids:
            has_msg = db.exec(
                select(Message).where(
                    Message.conversation_id.in_(conv_ids),
                    Message.is_from_user == True,
                    Message.created_at >= start_utc,
                    Message.created_at <= end_utc,
                ).limit(1)
            ).first()
        if has_msg:
            streak += 1
            d -= timedelta(days=1)
        else:
            if d == today:
                return 0
            break
    return streak


def _compute_today_minutes(db: Session, user_id: int, tz_name: str = "UTC") -> int:
    """Реальное время в диалоге сегодня: сумма длительностей сессий (от первого до последнего сообщения в каждом чате)."""
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("UTC")
    today = datetime.now(tz).date()
    start_utc, end_utc = _get_day_bounds_utc(today, tz_name)

    conv_ids = [r for r in db.exec(select(Conversation.id).where(Conversation.user_id == user_id)).all()]
    if not conv_ids:
        return 0

    total_seconds = 0
    for cid in conv_ids:
        msgs = list(
            db.exec(
                select(Message)
                .where(
                    Message.conversation_id == cid,
                    Message.created_at >= start_utc,
                    Message.created_at <= end_utc,
                )
                .order_by(Message.created_at.asc())
            ).all()
        )
        if len(msgs) >= 2:
            delta = (msgs[-1].created_at - msgs[0].created_at).total_seconds()
            total_seconds += min(delta, 14400)
        elif len(msgs) == 1:
            total_seconds += 60

    return min(180, int(total_seconds / 60))


def _estimate_level(words_count: int, conv_count: int) -> str:
    """Примерная оценка уровня CEFR по активности."""
    score = words_count + conv_count * 5
    if score >= 100:
        return "C1"
    if score >= 50:
        return "B2"
    if score >= 25:
        return "B1"
    if score >= 10:
        return "A2"
    return "A1"


@router.get("")
def get_stats(
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_session),
    x_user_timezone: str | None = Header(default=None, alias="X-User-Timezone"),
):
    """Статистика для главной: слова, серия, сегодня, уровень, последний диалог. Без авторизации — нули."""
    if not current_user:
        return {
            "user": None,
            "words_count": 0,
            "streak_days": 0,
            "today_minutes": 0,
            "level": "A2",
            "daily_goal_minutes": 20,
            "last_conversation": None,
        }

    words_count = db.exec(
        select(func.count(VocabularyWord.id)).where(
            (VocabularyWord.user_id == current_user.id) | (VocabularyWord.user_id.is_(None))
        )
    ).one() or 0

    conv_count = db.exec(
        select(func.count(Conversation.id)).where(Conversation.user_id == current_user.id)
    ).one() or 0

    tz_name = (x_user_timezone or "UTC").strip() or "UTC"
    streak_days = _compute_streak(db, current_user.id, tz_name)
    today_minutes = _compute_today_minutes(db, current_user.id, tz_name)
    level = _estimate_level(words_count, conv_count)
    daily_goal = getattr(current_user, "daily_goal_minutes", 20)

    last_conv = db.exec(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(1)
    ).first()

    last_conversation = None
    if last_conv:
        last_conversation = {
            "id": last_conv.id,
            "title": last_conv.title,
            "coach_type": last_conv.coach_type,
        }

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name or current_user.username,
            "email": current_user.email,
        },
        "words_count": words_count,
        "streak_days": streak_days,
        "today_minutes": today_minutes,
        "level": level,
        "daily_goal_minutes": daily_goal,
        "last_conversation": last_conversation,
        "conversations_count": conv_count,
    }


def _compute_day_minutes(db: Session, user_id: int, d: date, tz_name: str) -> int:
    """Минуты в диалоге за конкретный день."""
    start_utc, end_utc = _get_day_bounds_utc(d, tz_name)
    conv_ids = [r for r in db.exec(select(Conversation.id).where(Conversation.user_id == user_id)).all()]
    if not conv_ids:
        return 0
    total_seconds = 0
    for cid in conv_ids:
        msgs = list(
            db.exec(
                select(Message)
                .where(
                    Message.conversation_id == cid,
                    Message.created_at >= start_utc,
                    Message.created_at <= end_utc,
                )
                .order_by(Message.created_at.asc())
            ).all()
        )
        if len(msgs) >= 2:
            delta = (msgs[-1].created_at - msgs[0].created_at).total_seconds()
            total_seconds += min(delta, 14400)
        elif len(msgs) == 1:
            total_seconds += 60
    return min(180, int(total_seconds / 60))


@router.get("/activity")
def get_weekly_activity(
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_session),
    x_user_timezone: str | None = Header(default=None, alias="X-User-Timezone"),
):
    """Активность по дням за последние 7 дней (для графиков)."""
    if not current_user:
        return {"activity": []}
    tz_name = (x_user_timezone or "UTC").strip() or "UTC"
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("UTC")
    today = datetime.now(tz).date()
    activity = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        mins = _compute_day_minutes(db, current_user.id, d, tz_name)
        activity.append({"date": d.isoformat(), "minutes": mins})
    return {"activity": activity}
