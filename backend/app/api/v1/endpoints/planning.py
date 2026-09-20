from __future__ import annotations

from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.plan import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    PlanItemResponse,
    PlanItemUpdateRequest,
    PlanResponse,
)
from app.services.ai.schemas import PlanningAssistanceResponse
from app.services.planning_service import PlanningService

router = APIRouter(prefix="/planning", tags=["Planning"])


@router.post("/generate", response_model=PlanGenerateResponse, status_code=status.HTTP_200_OK)
async def generate_plan(
    request: PlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PlanGenerateResponse:
    service = PlanningService(db)
    return await service.generate_daily_plan(current_user.id, request)


def _parse_plan_date(d_str: str) -> date:
    if d_str.lower() in ("today", "current"):
        return date.today()
    try:
        return date.fromisoformat(d_str.split("T")[0])
    except Exception:
        return date.today()


@router.get("/{plan_date}", response_model=PlanResponse, status_code=status.HTTP_200_OK)
async def get_plan(
    plan_date: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PlanResponse:
    target_d = _parse_plan_date(plan_date)
    service = PlanningService(db)
    res = await service.get_plan_by_date(current_user.id, target_d)
    if not res:
        # If no plan exists, generate one automatically for target date
        gen_res = await service.generate_daily_plan(
            current_user.id, PlanGenerateRequest(target_date=target_d.isoformat())
        )
        return gen_res.plan
    return res


@router.patch("/items/{item_id}", response_model=PlanItemResponse, status_code=status.HTTP_200_OK)
async def update_plan_item(
    item_id: str,
    request: PlanItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PlanItemResponse:
    service = PlanningService(db)
    return await service.update_plan_item(current_user.id, item_id, request)


@router.get("/{plan_date}/ai-assist", response_model=PlanningAssistanceResponse, status_code=status.HTTP_200_OK)
async def get_plan_ai_assist(
    plan_date: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PlanningAssistanceResponse:
    target_d = _parse_plan_date(plan_date)
    from app.services.ai.ai_service import AIService
    ai_service = AIService(db=db)
    service = PlanningService(db)
    plan_res = await service.get_plan_by_date(current_user.id, target_d)
    if not plan_res:
        gen_res = await service.generate_daily_plan(
            current_user.id, PlanGenerateRequest(target_date=target_d.isoformat())
        )
        plan_res = gen_res.plan

    top_items = [
        {"id": item.id, "title": item.title, "duration_minutes": item.duration_minutes}
        for item in plan_res.items
    ]

    avail_hours = (
        current_user.preferences.daily_focus_capacity_hours
        if (current_user.preferences and current_user.preferences.daily_focus_capacity_hours)
        else 4.0
    )
    allocated_hours = round(plan_res.total_planned_minutes / 60.0, 1)

    return await ai_service.planner_assistant.assist(
        date=target_d.isoformat(),
        available_capacity_hours=avail_hours,
        allocated_hours=allocated_hours,
        top_items=top_items,
        conflicts=[],
    )

