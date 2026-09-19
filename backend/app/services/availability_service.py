from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundException
from app.models.availability import TimeAvailability
from app.models.schedule_block import ScheduleBlock
from app.repositories.availability_repo import AvailabilityRepository
from app.schemas.availability import (
    AvailabilityTemplateItem,
    AvailabilityTemplateResponse,
    AvailabilityTemplatesListResponse,
    AvailabilityTemplatesUpdateRequest,
    ScheduleBlockCreateRequest,
    ScheduleBlockResponse,
    ScheduleBlocksListResponse,
)


class AvailabilityService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.avail_repo = AvailabilityRepository(db)

    def _format_template(self, t: TimeAvailability) -> AvailabilityTemplateResponse:
        return AvailabilityTemplateResponse(
            id=t.id,
            day_of_week=t.day_of_week,
            start_time=t.start_time,
            end_time=t.end_time,
            is_available=t.is_available,
            capacity_hours=t.capacity_hours,
        )

    def _format_block(self, b: ScheduleBlock) -> ScheduleBlockResponse:
        return ScheduleBlockResponse(
            id=b.id,
            title=b.title,
            block_type=b.block_type,
            interest_id=b.interest_id,
            start_time=b.start_time.isoformat(),
            end_time=b.end_time.isoformat(),
            is_blackout=b.is_blackout,
        )

    async def list_templates(self, user_id: str) -> AvailabilityTemplatesListResponse:
        templates = await self.avail_repo.list_templates(user_id)
        return AvailabilityTemplatesListResponse(
            templates=[self._format_template(t) for t in templates]
        )

    async def replace_templates(
        self, user_id: str, req: AvailabilityTemplatesUpdateRequest
    ) -> AvailabilityTemplatesListResponse:
        new_records = [
            TimeAvailability(
                day_of_week=item.day_of_week,
                start_time=item.start_time,
                end_time=item.end_time,
                is_available=item.is_available,
                capacity_hours=item.capacity_hours,
            )
            for item in req.templates
        ]
        saved = await self.avail_repo.replace_templates(user_id, new_records)
        await self.db.commit()
        return AvailabilityTemplatesListResponse(
            templates=[self._format_template(t) for t in saved]
        )

    async def list_blocks(
        self,
        user_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> ScheduleBlocksListResponse:
        blocks = await self.avail_repo.list_blocks(user_id, start_time, end_time)
        return ScheduleBlocksListResponse(blocks=[self._format_block(b) for b in blocks])

    async def create_block(
        self, user_id: str, req: ScheduleBlockCreateRequest
    ) -> ScheduleBlockResponse:
        block = ScheduleBlock(
            user_id=user_id,
            title=req.title.strip(),
            block_type=req.block_type,
            interest_id=req.interest_id,
            start_time=req.start_time,
            end_time=req.end_time,
            is_blackout=req.is_blackout,
        )
        await self.avail_repo.create_block(block)
        await self.db.commit()
        return self._format_block(block)

    async def delete_block(self, user_id: str, block_id: str) -> None:
        deleted = await self.avail_repo.delete_block(block_id, user_id)
        if not deleted:
            raise NotFoundException(
                message=f"Schedule block '{block_id}' not found.",
                code="SCHEDULE_BLOCK_NOT_FOUND",
            )
        await self.db.commit()
