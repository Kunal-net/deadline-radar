from __future__ import annotations

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.tracking import (
    ActiveSessionResponse,
    ManualTimeEntryCreate,
    SessionStartRequest,
    SessionStartResponse,
    SessionStopRequest,
    SessionStopResponse,
    TimeEntryResponse,
)
from app.services.tracking_service import TrackingService

router = APIRouter()


@router.post(
    "/sessions/start",
    response_model=SessionStartResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a stopwatch session",
)
async def start_session(
    req: SessionStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TrackingService(db)
    return await service.start_session(current_user.id, req)


@router.get(
    "/sessions/active",
    response_model=Optional[ActiveSessionResponse],
    summary="Get currently running stopwatch session",
)
async def get_active_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TrackingService(db)
    return await service.get_active_session(current_user.id)


@router.post(
    "/sessions/stop",
    response_model=SessionStopResponse,
    summary="Stop the active stopwatch session and record time entry",
)
async def stop_session(
    req: SessionStopRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TrackingService(db)
    return await service.stop_session(current_user.id, req)


@router.post(
    "/entries",
    response_model=TimeEntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Manually log completed work time",
)
async def create_manual_entry(
    req: ManualTimeEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TrackingService(db)
    return await service.create_manual_entry(current_user.id, req)


@router.get(
    "/entries",
    response_model=PaginatedResponse[TimeEntryResponse],
    summary="List historical time entries",
)
async def list_entries(
    work_item_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TrackingService(db)
    return await service.list_entries(
        user_id=current_user.id,
        work_item_id=work_item_id,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
    )
