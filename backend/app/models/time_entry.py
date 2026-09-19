from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.work_item import WorkItem
    from app.models.work_unit import WorkUnit


class TimeEntry(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "time_entries"

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
    work_unit_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("work_units.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_hours: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(32), default="stopwatch", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="time_entries")
    work_item: Mapped[Optional["WorkItem"]] = relationship("WorkItem", back_populates="time_entries")
    work_unit: Mapped[Optional["WorkUnit"]] = relationship("WorkUnit", back_populates="time_entries")


class ActiveSession(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "active_sessions"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    work_item_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("work_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    work_unit_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("work_units.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User")
    work_item: Mapped[Optional["WorkItem"]] = relationship("WorkItem")
    work_unit: Mapped[Optional["WorkUnit"]] = relationship("WorkUnit")
