from __future__ import annotations

from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.preference import UserPreference
    from app.models.interest import UserInterest
    from app.models.availability import TimeAvailability
    from app.models.schedule_block import ScheduleBlock
    from app.models.work_item import WorkItem
    from app.models.time_entry import TimeEntry
    from app.models.pace_factor import UserPaceFactor
    from app.models.plan import Plan
    from app.models.notification import Notification
    from app.models.ai_analysis import AIAnalysis


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    preferences: Mapped[Optional["UserPreference"]] = relationship(
        "UserPreference", back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    interests: Mapped[List["UserInterest"]] = relationship(
        "UserInterest", back_populates="user", cascade="all, delete-orphan"
    )
    availability_templates: Mapped[List["TimeAvailability"]] = relationship(
        "TimeAvailability", back_populates="user", cascade="all, delete-orphan"
    )
    schedule_blocks: Mapped[List["ScheduleBlock"]] = relationship(
        "ScheduleBlock", back_populates="user", cascade="all, delete-orphan"
    )
    work_items: Mapped[List["WorkItem"]] = relationship(
        "WorkItem", back_populates="user", cascade="all, delete-orphan"
    )
    time_entries: Mapped[List["TimeEntry"]] = relationship(
        "TimeEntry", back_populates="user", cascade="all, delete-orphan"
    )
    pace_factors: Mapped[List["UserPaceFactor"]] = relationship(
        "UserPaceFactor", back_populates="user", cascade="all, delete-orphan"
    )
    plans: Mapped[List["Plan"]] = relationship(
        "Plan", back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    ai_analyses: Mapped[List["AIAnalysis"]] = relationship(
        "AIAnalysis", back_populates="user", cascade="all, delete-orphan"
    )
