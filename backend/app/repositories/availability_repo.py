from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.availability import TimeAvailability
from app.models.schedule_block import ScheduleBlock
from app.repositories.base import BaseRepository


class AvailabilityRepository(BaseRepository[TimeAvailability]):
    def __init__(self, session: AsyncSession):
        super().__init__(TimeAvailability, session)

    async def list_templates(self, user_id: str) -> List[TimeAvailability]:
        stmt = (
            select(TimeAvailability)
            .where(TimeAvailability.user_id == user_id)
            .order_by(TimeAvailability.day_of_week.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def replace_templates(
        self, user_id: str, new_templates: List[TimeAvailability]
    ) -> List[TimeAvailability]:
        await self.session.execute(
            delete(TimeAvailability).where(TimeAvailability.user_id == user_id)
        )
        for t in new_templates:
            t.user_id = user_id
            self.session.add(t)
        await self.session.flush()
        return await self.list_templates(user_id)

    async def list_blocks(
        self,
        user_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> List[ScheduleBlock]:
        query = select(ScheduleBlock).where(ScheduleBlock.user_id == user_id)
        if start_time:
            query = query.where(ScheduleBlock.end_time >= start_time)
        if end_time:
            query = query.where(ScheduleBlock.start_time <= end_time)
        query = query.order_by(ScheduleBlock.start_time.asc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_block_by_id(self, block_id: str, user_id: str) -> Optional[ScheduleBlock]:
        stmt = select(ScheduleBlock).where(
            ScheduleBlock.id == block_id,
            ScheduleBlock.user_id == user_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_block(self, block: ScheduleBlock) -> ScheduleBlock:
        self.session.add(block)
        await self.session.flush()
        return block

    async def delete_block(self, block_id: str, user_id: str) -> bool:
        block = await self.get_block_by_id(block_id, user_id)
        if not block:
            return False
        await self.session.delete(block)
        await self.session.flush()
        return True
