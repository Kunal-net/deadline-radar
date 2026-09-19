from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.work_item import WorkItem


class Notification(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "notifications"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    work_item_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("work_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(64), default="deadline_reminder", nullable=False)
    urgency_level: Mapped[str] = mapped_column(String(32), default="normal", nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    scheduled_for: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="notifications")
    work_item: Mapped[Optional["WorkItem"]] = relationship("WorkItem")
