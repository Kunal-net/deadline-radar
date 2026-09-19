from __future__ import annotations

from datetime import date
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.plan import Plan, PlanItem
from app.repositories.base import BaseRepository


class PlanningRepository(BaseRepository[Plan]):
    def __init__(self, session: AsyncSession):
        super().__init__(Plan, session)

    async def get_plan_by_date(self, user_id: str, plan_date: date) -> Optional[Plan]:
        stmt = (
            select(Plan)
            .where(Plan.user_id == user_id, Plan.plan_date == plan_date)
            .options(
                selectinload(Plan.items).selectinload(PlanItem.work_item),
                selectinload(Plan.items).selectinload(PlanItem.work_unit),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_plan_item(self, item_id: str, user_id: str) -> Optional[PlanItem]:
        stmt = (
            select(PlanItem)
            .join(Plan, PlanItem.plan_id == Plan.id)
            .where(PlanItem.id == item_id, Plan.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def save_plan(self, plan: Plan) -> Plan:
        self.session.add(plan)
        await self.session.flush()
        return plan
