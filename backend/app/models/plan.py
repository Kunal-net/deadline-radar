from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.work_item import WorkItem
    from app.models.work_unit import WorkUnit


class Plan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "plans"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    plan_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    total_planned_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_completed_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_finalized: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="plans")
    items: Mapped[List["PlanItem"]] = relationship(
        "PlanItem",
        back_populates="plan",
        cascade="all, delete-orphan",
        order_by="PlanItem.sequence_order",
    )


class PlanItem(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "plan_items"

    plan_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("plans.id", ondelete="CASCADE"),
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
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    planned_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    planned_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, default=1, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    is_protected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(),
        nullable=False,
    )

    plan: Mapped["Plan"] = relationship("Plan", back_populates="items")
    work_item: Mapped[Optional["WorkItem"]] = relationship("WorkItem")
    work_unit: Mapped[Optional["WorkUnit"]] = relationship("WorkUnit", back_populates="plan_items")
