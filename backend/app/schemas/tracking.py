from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import Field
from app.schemas.common import AppBaseModel


class SessionStartRequest(AppBaseModel):
    work_item_id: Optional[str] = None
    work_unit_id: Optional[str] = None
    notes: Optional[str] = None


class ActiveSessionResponse(AppBaseModel):
    id: str
    work_item_id: Optional[str] = None
    work_unit_id: Optional[str] = None
    work_item_title: Optional[str] = None
    work_unit_title: Optional[str] = None
    started_at: str
    elapsed_seconds: int = 0
    is_active: bool = True
    notes: Optional[str] = None


class SessionStartResponse(AppBaseModel):
    session: ActiveSessionResponse


class SessionStopRequest(AppBaseModel):
    notes: Optional[str] = None


class TimeEntryResponse(AppBaseModel):
    id: str
    work_item_id: Optional[str] = None
    work_unit_id: Optional[str] = None
    start_time: str
    end_time: str
    duration_minutes: int
    duration_hours: float
    source: str
    notes: Optional[str] = None


class SessionStopResponse(AppBaseModel):
    time_entry: TimeEntryResponse
    work_item_remaining_hours: Optional[float] = None
    pace_factor_updated: bool = False


class ManualTimeEntryCreate(AppBaseModel):
    work_item_id: Optional[str] = None
    work_unit_id: Optional[str] = None
    start_time: datetime = Field(..., alias="start_time_utc")
    end_time: datetime = Field(..., alias="end_time_utc")
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
