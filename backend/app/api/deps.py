from __future__ import annotations

from typing import AsyncGenerator
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.errors import UnauthorizedException
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repo import UserRepository


async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization:
        raise UnauthorizedException(
            message="Missing Authorization header",
            code="MISSING_TOKEN",
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedException(
            message="Invalid Authorization header format. Expected 'Bearer <token>'",
            code="INVALID_HEADER",
        )

    token = parts[1]
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException(
            message="Token missing subject claim",
            code="INVALID_TOKEN",
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_with_preferences(user_id)
    if not user or not user.is_active:
        raise UnauthorizedException(
            message="User not found or account is deactivated",
            code="USER_NOT_FOUND",
        )

    return user


def get_ai_service(db: AsyncSession = Depends(get_db)):
    from app.services.ai.ai_service import AIService
    return AIService(db=db)
