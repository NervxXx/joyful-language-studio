"""Утилиты пользователей"""
from models.user import User, UserResponse


def create_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        is_admin=user.is_admin,
        auth_provider=user.auth_provider,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login=user.last_login,
        daily_goal_minutes=getattr(user, "daily_goal_minutes", 20),
        notifications_enabled=getattr(user, "notifications_enabled", True),
        sound_enabled=getattr(user, "sound_enabled", True),
    )
