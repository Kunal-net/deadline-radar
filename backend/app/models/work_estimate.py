from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.work_item import WorkItem
    from app.models.work_unit import WorkUnit
    from app.models.user import User


class WorkEstimate(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "work_estimates"

    work_item_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("work_items.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    work_unit_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("work_units.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    estimate_type: Mapped[str] = mapped_column(String(32), default="ai_baseline", nullable=False)
    estimated_hours: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.8, nullable=False)
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    work_item: Mapped["WorkItem"] = relationship("WorkItem", back_populates="estimates")
    work_unit: Mapped[Optional["WorkUnit"]] = relationship("WorkUnit", back_populates="estimates")
    user: Mapped["User"] = relationship("User")
