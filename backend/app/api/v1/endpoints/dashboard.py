from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    TimelineProjectionResponse,
    WorkloadCapacityResponse,
)
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardSummaryResponse:
    """
    Get high-level operational radar summary:
    risk counts, critical approaching deadlines, and weekly focus capacity balance.
    """
    service = DashboardService(db)
    return await service.get_summary(current_user.id)


@router.get("/timeline/projection", response_model=TimelineProjectionResponse)
async def get_timeline_projection(
    start_date: Optional[datetime] = Query(None, description="Start date of timeline projection window"),
    days: int = Query(14, ge=1, le=60, description="Horizon length in days"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TimelineProjectionResponse:
    """
    Project active work items against actual calendar capacity slots.
    """
    service = DashboardService(db)
    return await service.get_timeline_projection(
        user_id=current_user.id,
        start_date=start_date,
        days=days,
    )


@router.get("/workload/capacity", response_model=WorkloadCapacityResponse)
async def get_workload_capacity(
    view: str = Query("day", pattern="^(day|week)$", description="Aggregation granularity"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkloadCapacityResponse:
    """
    Get capacity vs demand workload distribution aggregated by day or week.
    """
    service = DashboardService(db)
    return await service.get_workload_capacity(
        user_id=current_user.id,
        view=view,
        start_date=start_date,
        end_date=end_date,
    )
