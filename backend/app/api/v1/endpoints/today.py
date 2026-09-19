from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.plan import TodayOverviewResponse
from app.services.planning_service import PlanningService

router = APIRouter(prefix="/today", tags=["Today Execution"])


@router.get("/overview", response_model=TodayOverviewResponse, status_code=status.HTTP_200_OK)
async def get_today_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TodayOverviewResponse:
    service = PlanningService(db)
    return await service.get_today_overview(current_user.id)
