from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.work_unit import WorkUnit
    from app.models.work_estimate import WorkEstimate
    from app.models.time_entry import TimeEntry


class WorkItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "work_items"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(64), default="academic", index=True, nullable=False)
    importance_weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    deadline_utc: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    is_hard_deadline: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    deadline_timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    is_deadline_inferred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="todo", index=True, nullable=False)
    total_estimated_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    remaining_estimated_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_actual_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completion_pct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    risk_state: Mapped[str] = mapped_column(String(32), default="safe", index=True, nullable=False)
    risk_ratio: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    dynamic_priority: Mapped[float] = mapped_column(Float, default=50.0, index=True, nullable=False)
    priority_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_suggested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="work_items")
    units: Mapped[List["WorkUnit"]] = relationship(
        "WorkUnit",
        back_populates="work_item",
        cascade="all, delete-orphan",
        order_by="WorkUnit.sequence_order",
    )
    estimates: Mapped[List["WorkEstimate"]] = relationship(
        "WorkEstimate", back_populates="work_item", cascade="all, delete-orphan"
    )
    time_entries: Mapped[List["TimeEntry"]] = relationship(
        "TimeEntry", back_populates="work_item"
    )
