from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class TimeAvailability(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "time_availability"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Sun .. 6=Sat
    start_time: Mapped[str] = mapped_column(String(8), nullable=False)  # "18:00:00"
    end_time: Mapped[str] = mapped_column(String(8), nullable=False)    # "22:00:00"
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    capacity_hours: Mapped[float] = mapped_column(Float, default=4.0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="availability_templates")
