from __future__ import annotations

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.availability import (
    AvailabilityTemplatesListResponse,
    AvailabilityTemplatesUpdateRequest,
    ScheduleBlockCreateRequest,
    ScheduleBlockResponse,
    ScheduleBlocksListResponse,
)
from app.services.availability_service import AvailabilityService

router = APIRouter()


@router.get(
    "/templates",
    response_model=AvailabilityTemplatesListResponse,
    summary="Get 7-day recurring weekly availability templates",
)
async def get_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvailabilityService(db)
    return await service.list_templates(current_user.id)


@router.put(
    "/templates",
    response_model=AvailabilityTemplatesListResponse,
    summary="Replace 7-day recurring weekly availability templates",
)
async def replace_templates(
    req: AvailabilityTemplatesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvailabilityService(db)
    return await service.replace_templates(current_user.id, req)


@router.get(
    "/blocks",
    response_model=ScheduleBlocksListResponse,
    summary="List schedule commitments and blackouts in a date range",
)
async def list_blocks(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvailabilityService(db)
    return await service.list_blocks(current_user.id, start_date, end_date)


@router.post(
    "/blocks",
    response_model=ScheduleBlockResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a schedule commitment, blackout, or protected interest block",
)
async def create_block(
    req: ScheduleBlockCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvailabilityService(db)
    return await service.create_block(current_user.id, req)


@router.delete(
    "/blocks/{block_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a schedule block",
)
async def delete_block(
    block_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvailabilityService(db)
    await service.delete_block(current_user.id, block_id)
    return None
