from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.work import (
    UnitReorderRequest,
    WorkItemCreateRequest,
    WorkItemResponse,
    WorkItemUpdateRequest,
    WorkUnitCreateRequest,
    WorkUnitResponse,
    WorkUnitsListResponse,
    WorkUnitUpdateRequest,
)
from app.services.work_service import WorkService

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[WorkItemResponse],
    summary="List work items with filters, sorting, and pagination",
)
async def list_work_items(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    risk_state: Optional[str] = Query(None),
    due_before: Optional[datetime] = Query(None),
    sort_by: str = Query("dynamic_priority"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    return await service.list_work_items(
        user_id=current_user.id,
        status=status,
        category=category,
        risk_state=risk_state,
        due_before=due_before,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=WorkItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new work item",
)
async def create_work_item(
    req: WorkItemCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    return await service.create_work_item(current_user.id, req)


@router.get(
    "/{work_id}",
    response_model=WorkItemResponse,
    summary="Get work item detail",
)
async def get_work_item(
    work_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    return await service.get_work_item(work_id, current_user.id)


@router.patch(
    "/{work_id}",
    response_model=WorkItemResponse,
    summary="Update work item fields or status",
)
async def update_work_item(
    work_id: str,
    req: WorkItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    return await service.update_work_item(work_id, current_user.id, req)


@router.delete(
    "/{work_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete work item and associated subtasks",
)
async def delete_work_item(
    work_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    await service.delete_work_item(work_id, current_user.id)
    return None


@router.get(
    "/{work_id}/units",
    response_model=WorkUnitsListResponse,
    summary="List subtasks for a work item in sequence order",
)
async def list_work_units(
    work_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    units = await service.list_units(work_id, current_user.id)
    return WorkUnitsListResponse(units=units)


@router.post(
    "/{work_id}/units",
    response_model=WorkUnitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a subtask to an existing work item",
)
async def add_work_unit(
    work_id: str,
    req: WorkUnitCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    return await service.add_unit(work_id, current_user.id, req)


@router.patch(
    "/{work_id}/units/{unit_id}",
    response_model=WorkUnitResponse,
    summary="Update subtask fields or toggle completion",
)
async def update_work_unit(
    work_id: str,
    unit_id: str,
    req: WorkUnitUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    return await service.update_unit(work_id, unit_id, current_user.id, req)


@router.delete(
    "/{work_id}/units/{unit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a subtask",
)
async def delete_work_unit(
    work_id: str,
    unit_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    await service.delete_unit(work_id, unit_id, current_user.id)
    return None


@router.put(
    "/{work_id}/units/reorder",
    response_model=WorkUnitsListResponse,
    summary="Reorder subtasks in sequence",
)
async def reorder_work_units(
    work_id: str,
    req: UnitReorderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkService(db)
    units = await service.reorder_units(work_id, current_user.id, req)
    return WorkUnitsListResponse(units=units)


@router.post(
    "/recalculate",
    summary="Trigger deterministic workload recalculation, risk transitions, and notification dispatch",
)
async def recalculate_workload(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.background_recalculation import BackgroundRecalculationService
    service = BackgroundRecalculationService(db)
    return await service.recalculate_user_workload(current_user.id)


@router.get(
    "/{work_id}/explanation",
    summary="Get grounded AI explanation for work item risk and priority",
)
async def get_work_item_explanation(
    work_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.ai.ai_service import AIService
    from app.services.ai.schemas import ExplanationRequest
    from datetime import datetime, timezone
    
    work_service = WorkService(db)
    item = await work_service.get_work_item(work_id, current_user.id)

    now = datetime.now(timezone.utc)
    days_left = None
    if item.deadline_utc:
        try:
            dl = datetime.fromisoformat(item.deadline_utc.replace("Z", "+00:00"))
            days_left = max(0.0, round((dl - now).total_seconds() / 86400.0, 1))
        except Exception:
            pass

    avail = (
        round(item.remaining_estimated_hours / item.risk_ratio, 1)
        if (item.risk_ratio and item.risk_ratio > 0)
        else 8.0
    )

    req = ExplanationRequest(
        work_id=item.id,
        title=item.title,
        risk_state=item.risk_state,
        risk_ratio=item.risk_ratio,
        dynamic_priority=item.dynamic_priority,
        remaining_hours=item.remaining_estimated_hours,
        available_hours=avail,
        days_until_deadline=days_left,
        factors=[item.priority_explanation] if item.priority_explanation else [],
    )
    ai_service = AIService(db=db)
    return await ai_service.explainer.explain(req)
