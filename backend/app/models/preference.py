from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserPreference(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "user_preferences"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    daily_focus_capacity_hours: Mapped[float] = mapped_column(Float, default=4.0, nullable=False)
    buffer_percentage: Mapped[float] = mapped_column(Float, default=20.0, nullable=False)
    preferred_work_chunk_minutes: Mapped[int] = mapped_column(Integer, default=90, nullable=False)
    min_break_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    remind_risk_escalation: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    remind_7_days: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    remind_3_days: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    remind_1_day: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    morning_plan_briefing: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    briefing_time: Mapped[str] = mapped_column(String(8), default="08:00", nullable=False)
    ai_assistance_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    theme: Mapped[str] = mapped_column(String(32), default="dark_editorial", nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="preferences")
