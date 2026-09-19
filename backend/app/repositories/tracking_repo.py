from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.time_entry import ActiveSession, TimeEntry
from app.repositories.base import BaseRepository


class TrackingRepository(BaseRepository[TimeEntry]):
    def __init__(self, session: AsyncSession):
        super().__init__(TimeEntry, session)

    async def get_active_session(self, user_id: str) -> Optional[ActiveSession]:
        stmt = (
            select(ActiveSession)
            .where(ActiveSession.user_id == user_id, ActiveSession.is_active == True)
            .options(selectinload(ActiveSession.work_item), selectinload(ActiveSession.work_unit))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_active_session(self, session: ActiveSession) -> ActiveSession:
        self.session.add(session)
        await self.session.flush()
        return session

    async def delete_active_session(self, session: ActiveSession) -> None:
        await self.session.delete(session)
        await self.session.flush()

    async def create_entry(self, entry: TimeEntry) -> TimeEntry:
        self.session.add(entry)
        await self.session.flush()
        return entry

    async def list_entries(
        self,
        user_id: str,
        work_item_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[TimeEntry], int]:
        query = select(TimeEntry).where(TimeEntry.user_id == user_id)
        if work_item_id:
            query = query.where(TimeEntry.work_item_id == work_item_id)
        if start_date:
            query = query.where(TimeEntry.end_time >= start_date)
        if end_date:
            query = query.where(TimeEntry.start_time <= end_date)

        count_stmt = select(func.count()).select_from(query.subquery())
        count_res = await self.session.execute(count_stmt)
        total = count_res.scalar_one()

        query = query.order_by(TimeEntry.start_time.desc()).limit(limit).offset(offset)
        res = await self.session.execute(query)
        items = list(res.scalars().all())

        return items, total
