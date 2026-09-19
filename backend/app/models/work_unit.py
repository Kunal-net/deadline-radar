from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.work_item import WorkItem
    from app.models.user import User
    from app.models.work_estimate import WorkEstimate
    from app.models.time_entry import TimeEntry
    from app.models.plan import PlanItem


class WorkUnit(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "work_units"

    work_item_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("work_items.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sequence_order: Mapped[int] = mapped_column(Integer, default=1, index=True, nullable=False)
    estimated_hours: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    is_user_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    work_item: Mapped["WorkItem"] = relationship("WorkItem", back_populates="units")
    user: Mapped["User"] = relationship("User")
    estimates: Mapped[List["WorkEstimate"]] = relationship(
        "WorkEstimate", back_populates="work_unit", cascade="all, delete-orphan"
    )
    time_entries: Mapped[List["TimeEntry"]] = relationship("TimeEntry", back_populates="work_unit")
    plan_items: Mapped[List["PlanItem"]] = relationship("PlanItem", back_populates="work_unit")
