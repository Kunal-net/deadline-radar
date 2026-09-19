from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserPaceFactor(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "user_pace_factors"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    category: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    pace_factor: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    total_estimated_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_actual_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sample_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="pace_factors")
