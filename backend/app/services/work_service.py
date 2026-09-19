from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundException
from app.models.work_estimate import WorkEstimate
from app.models.work_item import WorkItem
from app.models.work_unit import WorkUnit
from app.repositories.work_repo import WorkItemRepository
from app.schemas.common import PaginatedResponse
from app.domain.priority_engine import PriorityEngine, WorkItemPriorityInput
from app.schemas.work import (
    UnitReorderRequest,
    WorkItemCreateRequest,
    WorkItemResponse,
    WorkItemUpdateRequest,
    WorkUnitCreateRequest,
    WorkUnitResponse,
    WorkUnitUpdateRequest,
)


class WorkService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.work_repo = WorkItemRepository(db)

    def _format_unit(self, u: WorkUnit) -> WorkUnitResponse:
        return WorkUnitResponse(
            id=u.id,
            work_item_id=u.work_item_id,
            title=u.title,
            description=u.description,
            sequence_order=u.sequence_order,
            is_completed=u.is_completed,
            completed_at=u.completed_at.isoformat() if u.completed_at else None,
            estimated_hours=u.estimated_hours,
            actual_hours=u.actual_hours,
            is_user_verified=u.is_user_verified,
        )

    def _format_item(self, item: WorkItem) -> WorkItemResponse:
        units = item.units or []
        completed_units = [u for u in units if u.is_completed]
        return WorkItemResponse(
            id=item.id,
            title=item.title,
            description=item.description,
            category=item.category,
            status=item.status,
            importance_weight=item.importance_weight,
            deadline_utc=item.deadline_utc.isoformat() if item.deadline_utc else None,
            is_hard_deadline=item.is_hard_deadline,
            total_estimated_hours=item.total_estimated_hours,
            remaining_estimated_hours=item.remaining_estimated_hours,
            total_actual_hours=item.total_actual_hours,
            completion_pct=item.completion_pct,
            risk_state=item.risk_state,
            risk_ratio=item.risk_ratio,
            dynamic_priority=item.dynamic_priority,
            priority_explanation=item.priority_explanation,
            units_count=len(units),
            completed_units_count=len(completed_units),
            units=[self._format_unit(u) for u in units] if item.units is not None else None,
            created_at=item.created_at.isoformat(),
            updated_at=item.updated_at.isoformat(),
        )

    def _recalculate_item_metrics(self, item: WorkItem) -> None:
        units = item.units or []
        if units:
            total_est = sum(u.estimated_hours for u in units)
            total_act = sum(u.actual_hours for u in units)
            completed_units = [u for u in units if u.is_completed]
            remaining_est = sum(u.estimated_hours for u in units if not u.is_completed)
            pct = int((len(completed_units) / len(units)) * 100) if units else 0

            item.total_estimated_hours = round(total_est, 2)
            item.total_actual_hours = round(total_act, 2)
            item.remaining_estimated_hours = round(remaining_est, 2)
            item.completion_pct = pct

            if pct == 100 and item.status != "completed":
                item.status = "completed"
                item.completed_at = datetime.now(timezone.utc)
                item.remaining_estimated_hours = 0.0

        if item.status == "completed":
            item.remaining_estimated_hours = 0.0
            item.completion_pct = 100
            item.risk_state = "safe"
            item.risk_ratio = 0.0
            item.dynamic_priority = 0.0
            item.priority_explanation = "Work item is completed."
            return

        # Basic baseline risk and priority estimation
        now = datetime.now(timezone.utc)
        if item.deadline_utc:
            deadline = item.deadline_utc
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            time_to_deadline = (deadline - now).total_seconds() / 3600.0
            if time_to_deadline <= 0:
                item.risk_state = "overdue"
                item.risk_ratio = 9.99
            else:
                # Rough baseline capacity: assume ~4h available per 24h day
                days = max(time_to_deadline / 24.0, 0.1)
                rough_capacity = max(days * 4.0, 0.5)
                ratio = round(item.remaining_estimated_hours / rough_capacity, 2)
                item.risk_ratio = ratio

                if ratio >= 1.5:
                    item.risk_state = "critical"
                elif ratio >= 1.0:
                    item.risk_state = "at_risk"
                elif ratio >= 0.7:
                    item.risk_state = "watch"
                else:
                    item.risk_state = "safe"
        else:
            item.risk_state = "safe"
            item.risk_ratio = 0.0

        # Execute deterministic PriorityEngine
        priority_input = WorkItemPriorityInput(
            item_id=item.id,
            title=item.title,
            status=item.status,
            deadline_utc=item.deadline_utc,
            remaining_hours=item.remaining_estimated_hours,
            importance_weight=item.importance_weight,
            risk_state=item.risk_state,
            risk_ratio=item.risk_ratio,
            is_hard_deadline=item.is_hard_deadline,
            completion_pct=item.completion_pct,
        )
        priority_eval = PriorityEngine.evaluate(priority_input, current_time=now)
        item.dynamic_priority = priority_eval.priority_score
        item.priority_explanation = priority_eval.priority_explanation

    async def list_work_items(
        self,
        user_id: str,
        status: Optional[str] = None,
        category: Optional[str] = None,
        risk_state: Optional[str] = None,
        due_before: Optional[datetime] = None,
        sort_by: str = "dynamic_priority",
        order: str = "desc",
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[WorkItemResponse]:
        offset = (page - 1) * page_size
        items, total = await self.work_repo.list_work_items(
            user_id=user_id,
            status=status,
            category=category,
            risk_state=risk_state,
            due_before=due_before,
            sort_by=sort_by,
            order=order,
            limit=page_size,
            offset=offset,
        )
        return PaginatedResponse(
            items=[self._format_item(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            has_more=(offset + len(items)) < total,
        )

    async def create_work_item(self, user_id: str, req: WorkItemCreateRequest) -> WorkItemResponse:
        total_est = req.estimated_hours
        if req.initial_units:
            total_est = sum(u.estimated_hours for u in req.initial_units)

        item = WorkItem(
            user_id=user_id,
            title=req.title.strip(),
            description=req.description,
            category=req.category,
            deadline_utc=req.deadline_utc,
            is_hard_deadline=req.is_hard_deadline,
            importance_weight=req.importance_weight,
            total_estimated_hours=total_est,
            remaining_estimated_hours=total_est,
            status="todo",
        )
        self._recalculate_item_metrics(item)
        await self.work_repo.create(item)

        if req.initial_units:
            for idx, u_req in enumerate(req.initial_units, start=1):
                unit = WorkUnit(
                    work_item_id=item.id,
                    user_id=user_id,
                    title=u_req.title.strip(),
                    description=u_req.description,
                    sequence_order=idx,
                    estimated_hours=u_req.estimated_hours,
                )
                await self.work_repo.create_unit(unit)

        await self.db.commit()
        refreshed = await self.work_repo.get_by_user(item.id, user_id)
        return self._format_item(refreshed or item)

    async def get_work_item(self, work_item_id: str, user_id: str) -> WorkItemResponse:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )
        return self._format_item(item)

    async def update_work_item(
        self, work_item_id: str, user_id: str, req: WorkItemUpdateRequest
    ) -> WorkItemResponse:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )

        update_dict = req.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(item, key, value)

        if req.status == "completed":
            item.completed_at = datetime.now(timezone.utc)
            for unit in item.units:
                unit.is_completed = True
                unit.completed_at = datetime.now(timezone.utc)

        self._recalculate_item_metrics(item)
        await self.db.commit()
        refreshed = await self.work_repo.get_by_user(work_item_id, user_id)
        return self._format_item(refreshed or item)

    async def delete_work_item(self, work_item_id: str, user_id: str) -> None:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )
        await self.work_repo.delete(item)
        await self.db.commit()

    async def list_units(self, work_item_id: str, user_id: str) -> List[WorkUnitResponse]:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )
        units = await self.work_repo.list_units(work_item_id, user_id)
        return [self._format_unit(u) for u in units]

    async def add_unit(
        self, work_item_id: str, user_id: str, req: WorkUnitCreateRequest
    ) -> WorkUnitResponse:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )

        unit = WorkUnit(
            work_item_id=work_item_id,
            user_id=user_id,
            title=req.title.strip(),
            description=req.description,
            sequence_order=req.sequence_order,
            estimated_hours=req.estimated_hours,
        )
        await self.work_repo.create_unit(unit)
        if item.units is not None:
            item.units.append(unit)
        self._recalculate_item_metrics(item)
        await self.db.commit()
        return self._format_unit(unit)

    async def update_unit(
        self, work_item_id: str, unit_id: str, user_id: str, req: WorkUnitUpdateRequest
    ) -> WorkUnitResponse:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )

        unit = await self.work_repo.get_unit(unit_id, user_id)
        if not unit or unit.work_item_id != work_item_id:
            raise NotFoundException(
                message=f"Work unit '{unit_id}' not found in work item '{work_item_id}'.",
                code="WORK_UNIT_NOT_FOUND",
            )

        update_dict = req.model_dump(exclude_unset=True)
        if "is_completed" in update_dict and update_dict["is_completed"] and not unit.is_completed:
            unit.completed_at = datetime.now(timezone.utc)
        elif "is_completed" in update_dict and not update_dict["is_completed"]:
            unit.completed_at = None

        for key, value in update_dict.items():
            setattr(unit, key, value)

        self._recalculate_item_metrics(item)
        await self.db.commit()
        return self._format_unit(unit)

    async def delete_unit(self, work_item_id: str, unit_id: str, user_id: str) -> None:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )
        unit = await self.work_repo.get_unit(unit_id, user_id)
        if not unit or unit.work_item_id != work_item_id:
            raise NotFoundException(
                message=f"Work unit '{unit_id}' not found.",
                code="WORK_UNIT_NOT_FOUND",
            )
        await self.db.delete(unit)
        if item.units is not None and unit in item.units:
            item.units.remove(unit)
        self._recalculate_item_metrics(item)
        await self.db.commit()

    async def reorder_units(
        self, work_item_id: str, user_id: str, req: UnitReorderRequest
    ) -> List[WorkUnitResponse]:
        item = await self.work_repo.get_by_user(work_item_id, user_id)
        if not item:
            raise NotFoundException(
                message=f"Work item '{work_item_id}' not found.",
                code="WORK_ITEM_NOT_FOUND",
            )
        order_dicts = [{"unit_id": u.unit_id, "sequence_order": u.sequence_order} for u in req.unit_orders]
        units = await self.work_repo.reorder_units(work_item_id, user_id, order_dicts)
        await self.db.commit()
        return [self._format_unit(u) for u in units]
