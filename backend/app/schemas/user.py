from __future__ import annotations

from typing import List, Optional
from pydantic import Field
from app.schemas.common import AppBaseModel


class UserPreferencesResponse(AppBaseModel):
    id: str
    user_id: str
    timezone: str
    daily_focus_capacity_hours: float
    buffer_percentage: float
    preferred_work_chunk_minutes: int
    min_break_minutes: int
    remind_risk_escalation: bool
    remind_7_days: bool
    remind_3_days: bool
    remind_1_day: bool
    morning_plan_briefing: bool
    briefing_time: str
    ai_assistance_enabled: bool
    theme: str


class UserPreferencesUpdateRequest(AppBaseModel):
    timezone: Optional[str] = None
    daily_focus_capacity_hours: Optional[float] = Field(None, ge=1.0, le=24.0)
    buffer_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    preferred_work_chunk_minutes: Optional[int] = Field(None, ge=15, le=360)
    min_break_minutes: Optional[int] = Field(None, ge=5, le=120)
    remind_risk_escalation: Optional[bool] = None
    remind_7_days: Optional[bool] = None
    remind_3_days: Optional[bool] = None
    remind_1_day: Optional[bool] = None
    morning_plan_briefing: Optional[bool] = None
    briefing_time: Optional[str] = None
    ai_assistance_enabled: Optional[bool] = None
    theme: Optional[str] = None


class UserInterestCreate(AppBaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    category: str = Field(default="fitness", max_length=64)
    target_weekly_hours: float = Field(default=4.0, ge=0.5, le=40.0)
    is_protected: bool = True
    color_hex: str = Field(default="#E07A5F", max_length=16)


class UserInterestResponse(AppBaseModel):
    id: str
    name: str
    category: str
    target_weekly_hours: float
    is_protected: bool
    color_hex: str


class UserInterestsListResponse(AppBaseModel):
    interests: List[UserInterestResponse]
