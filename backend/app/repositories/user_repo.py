from __future__ import annotations

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.interest import UserInterest
from app.models.preference import UserPreference
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = (
            select(User)
            .where(User.email == email.strip().lower())
            .options(selectinload(User.preferences))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_preferences(self, user_id: str) -> Optional[User]:
        stmt = (
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.preferences), selectinload(User.interests))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_preferences(self, user_id: str) -> Optional[UserPreference]:
        stmt = select(UserPreference).where(UserPreference.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_interests(self, user_id: str) -> List[UserInterest]:
        stmt = (
            select(UserInterest)
            .where(UserInterest.user_id == user_id)
            .order_by(UserInterest.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_interest_by_id(self, interest_id: str, user_id: str) -> Optional[UserInterest]:
        stmt = select(UserInterest).where(
            UserInterest.id == interest_id,
            UserInterest.user_id == user_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
