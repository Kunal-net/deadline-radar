from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationsListResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationsListResponse, status_code=status.HTTP_200_OK)
async def list_notifications(
    status: str = Query("all", description="Filter: 'all', 'unread', or 'read'"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationsListResponse:
    service = NotificationService(db)
    return await service.list_notifications(
        user_id=current_user.id, status=status, limit=limit, offset=offset
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse, status_code=status.HTTP_200_OK)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationResponse:
    service = NotificationService(db)
    return await service.mark_read(notification_id, current_user.id)


@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    service = NotificationService(db)
    count = await service.mark_all_read(current_user.id)
    return {"marked_read_count": count}
