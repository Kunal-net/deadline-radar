from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.interest import UserInterest


class ScheduleBlock(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "schedule_blocks"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    interest_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("user_interests.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    block_type: Mapped[str] = mapped_column(String(64), default="hard_commitment", nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    is_blackout: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="schedule_blocks")
    interest: Mapped[Optional["UserInterest"]] = relationship("UserInterest")
