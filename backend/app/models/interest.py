from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserInterest(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "user_interests"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    category: Mapped[str] = mapped_column(String(64), default="fitness", nullable=False)
    target_weekly_hours: Mapped[float] = mapped_column(Float, default=4.0, nullable=False)
    is_protected: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    color_hex: Mapped[str] = mapped_column(String(16), default="#E07A5F", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="interests")
