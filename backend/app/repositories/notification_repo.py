from __future__ import annotations

from typing import List, Optional, Tuple
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, session: AsyncSession):
        super().__init__(Notification, session)

    async def list_notifications(
        self,
        user_id: str,
        status: str = "all",
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[Notification], int]:
        query = select(Notification).where(Notification.user_id == user_id)
        if status == "unread":
            query = query.where(Notification.is_read == False)
        elif status == "read":
            query = query.where(Notification.is_read == True)

        count_stmt = select(func.count()).select_from(query.subquery())
        count_res = await self.session.execute(count_stmt)
        total = count_res.scalar_one()

        query = query.order_by(Notification.created_at.desc()).limit(limit).offset(offset)
        res = await self.session.execute(query)
        items = list(res.scalars().all())

        return items, total

    async def count_unread(self, user_id: str) -> int:
        stmt = select(func.count(Notification.id)).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
        res = await self.session.execute(stmt)
        return int(res.scalar_one())

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        stmt = select(Notification).where(
            Notification.id == notification_id, Notification.user_id == user_id
        )
        res = await self.session.execute(stmt)
        notif = res.scalar_one_or_none()
        if not notif:
            return False
        notif.is_read = True
        await self.session.flush()
        return True

    async def mark_all_as_read(self, user_id: str) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        res = await self.session.execute(stmt)
        await self.session.flush()
        return res.rowcount
