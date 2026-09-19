from __future__ import annotations

from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pace_factor import UserPaceFactor
from app.models.time_entry import TimeEntry
from app.models.work_item import WorkItem
from app.repositories.base import BaseRepository


class InsightsRepository(BaseRepository[UserPaceFactor]):
    def __init__(self, session: AsyncSession):
        super().__init__(UserPaceFactor, session)

    async def get_by_category(self, user_id: str, category: str) -> Optional[UserPaceFactor]:
        stmt = select(UserPaceFactor).where(
            UserPaceFactor.user_id == user_id,
            UserPaceFactor.category == category,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str) -> List[UserPaceFactor]:
        stmt = (
            select(UserPaceFactor)
            .where(UserPaceFactor.user_id == user_id)
            .order_by(UserPaceFactor.sample_count.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def upsert_factor(self, factor: UserPaceFactor) -> UserPaceFactor:
        self.session.add(factor)
        await self.session.flush()
        return factor

    async def get_user_logged_hours(self, user_id: str) -> float:
        stmt = select(func.coalesce(func.sum(TimeEntry.duration_hours), 0.0)).where(
            TimeEntry.user_id == user_id
        )
        res = await self.session.execute(stmt)
        return float(res.scalar_one())

    async def get_user_estimated_hours(self, user_id: str) -> float:
        stmt = select(func.coalesce(func.sum(WorkItem.total_estimated_hours), 0.0)).where(
            WorkItem.user_id == user_id
        )
        res = await self.session.execute(stmt)
        return float(res.scalar_one())
