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


@router.get("/{plan_date}", response_model=PlanResponse, status_code=status.HTTP_200_OK)
async def get_plan(
    plan_date: date,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PlanResponse:
    service = PlanningService(db)
    res = await service.get_plan_by_date(current_user.id, plan_date)
    if not res:
        # If no plan exists, generate one automatically for target date
        gen_res = await service.generate_daily_plan(
            current_user.id, PlanGenerateRequest(target_date=plan_date.isoformat())
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
