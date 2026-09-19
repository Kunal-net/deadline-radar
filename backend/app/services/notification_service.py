from __future__ import annotations

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundException
from app.models.notification import Notification
from app.repositories.notification_repo import NotificationRepository
from app.schemas.notification import NotificationResponse, NotificationsListResponse


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notif_repo = NotificationRepository(db)

    def _format_notification(self, n: Notification) -> NotificationResponse:
        return NotificationResponse(
            id=n.id,
            work_item_id=n.work_item_id,
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            urgency_level=n.urgency_level,
            is_read=n.is_read,
            created_at=n.created_at.isoformat(),
        )

    async def list_notifications(
        self,
        user_id: str,
        status: str = "all",
        limit: int = 20,
        offset: int = 0,
    ) -> NotificationsListResponse:
        items, total = await self.notif_repo.list_notifications(
            user_id=user_id, status=status, limit=limit, offset=offset
        )
        unread_count = await self.notif_repo.count_unread(user_id)
        return NotificationsListResponse(
            items=[self._format_notification(n) for n in items],
            unread_count=unread_count,
            total=total,
        )

    async def mark_read(self, notification_id: str, user_id: str) -> NotificationResponse:
        success = await self.notif_repo.mark_as_read(notification_id, user_id)
        if not success:
            raise NotFoundException(f"Notification '{notification_id}' not found.")
        
        notif = await self.notif_repo.get_by_id(notification_id)
        return self._format_notification(notif)  # type: ignore

    async def mark_all_read(self, user_id: str) -> int:
        return await self.notif_repo.mark_all_as_read(user_id)
