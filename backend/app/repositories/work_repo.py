from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.work_estimate import WorkEstimate
from app.models.work_item import WorkItem
from app.models.work_unit import WorkUnit
from app.repositories.base import BaseRepository


class WorkItemRepository(BaseRepository[WorkItem]):
    def __init__(self, session: AsyncSession):
        super().__init__(WorkItem, session)

    async def get_by_user(self, work_item_id: str, user_id: str) -> Optional[WorkItem]:
        stmt = (
            select(WorkItem)
            .where(WorkItem.id == work_item_id, WorkItem.user_id == user_id)
            .options(selectinload(WorkItem.units), selectinload(WorkItem.estimates))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_work_items(
        self,
        user_id: str,
        status: Optional[str] = None,
        category: Optional[str] = None,
        risk_state: Optional[str] = None,
        due_before: Optional[datetime] = None,
        sort_by: str = "dynamic_priority",
        order: str = "desc",
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[WorkItem], int]:
        query = select(WorkItem).where(WorkItem.user_id == user_id)

        if status:
            query = query.where(WorkItem.status == status)
        if category:
            query = query.where(WorkItem.category == category)
        if risk_state:
            query = query.where(WorkItem.risk_state == risk_state)
        if due_before:
            query = query.where(WorkItem.deadline_utc <= due_before)

        # Count total matching
        count_stmt = select(func.count()).select_from(query.subquery())
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        # Sorting
        sort_col = getattr(WorkItem, sort_by, WorkItem.dynamic_priority)
        if order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        query = query.options(selectinload(WorkItem.units)).limit(limit).offset(offset)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def list_units(self, work_item_id: str, user_id: str) -> List[WorkUnit]:
        stmt = (
            select(WorkUnit)
            .where(WorkUnit.work_item_id == work_item_id, WorkUnit.user_id == user_id)
            .order_by(WorkUnit.sequence_order.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_unit(self, unit_id: str, user_id: str) -> Optional[WorkUnit]:
        stmt = select(WorkUnit).where(WorkUnit.id == unit_id, WorkUnit.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_unit(self, unit: WorkUnit) -> WorkUnit:
        self.session.add(unit)
        await self.session.flush()
        return unit

    async def reorder_units(
        self, work_item_id: str, user_id: str, orders: List[Dict[str, Any]]
    ) -> List[WorkUnit]:
        units = await self.list_units(work_item_id, user_id)
        unit_map = {u.id: u for u in units}
        for item in orders:
            uid = item.get("unit_id")
            seq = item.get("sequence_order")
            if uid in unit_map and seq is not None:
                unit_map[uid].sequence_order = seq
        await self.session.flush()
        return await self.list_units(work_item_id, user_id)

    async def add_estimate(self, estimate: WorkEstimate) -> WorkEstimate:
        self.session.add(estimate)
        await self.session.flush()
        return estimate
