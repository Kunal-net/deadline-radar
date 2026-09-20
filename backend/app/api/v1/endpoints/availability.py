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


@router.get(
    "/export.ics",
    summary="Export calendar commitments and deadlines as an iCalendar file",
)
async def export_calendar_ics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi.responses import Response
    from app.repositories.work_repo import WorkItemRepository

    avail_service = AvailabilityService(db)
    blocks_res = await avail_service.list_blocks(current_user.id)
    blocks = blocks_res.blocks
    work_repo = WorkItemRepository(db)
    items, _ = await work_repo.list_work_items(current_user.id, limit=100)

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Deadline Radar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Deadline Radar Schedule",
    ]

    for b in blocks:
        start_clean = b.start_time.replace("-", "").replace(":", "").replace("+0000", "Z")
        if "T" not in start_clean:
            start_clean += "T000000Z"
        end_clean = b.end_time.replace("-", "").replace(":", "").replace("+0000", "Z")
        if "T" not in end_clean:
            end_clean += "T000000Z"
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:block-{b.id}@deadlineradar",
            f"SUMMARY:{b.title}",
            f"DTSTART:{start_clean}",
            f"DTEND:{end_clean}",
            f"DESCRIPTION:Block type: {b.block_type}",
            "END:VEVENT",
        ])

    for w in items:
        if w.deadline_utc:
            dt_str = w.deadline_utc.strftime("%Y%m%dT%H%M%SZ")
            lines.extend([
                "BEGIN:VEVENT",
                f"UID:work-{w.id}@deadlineradar",
                f"SUMMARY:DEADLINE: {w.title}",
                f"DTSTART:{dt_str}",
                f"DTEND:{dt_str}",
                f"DESCRIPTION:Category: {w.category} | Remaining: {w.remaining_estimated_hours}h | Risk: {w.risk_state}",
                "END:VEVENT",
            ])

    lines.append("END:VCALENDAR")
    ics_body = "\r\n".join(lines) + "\r\n"

    return Response(
        content=ics_body,
        media_type="text/calendar",
        headers={"Content-Disposition": "attachment; filename=deadline_radar.ics"},
    )

