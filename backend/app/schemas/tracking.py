from datetime import datetime, timezone, timedelta
from typing import Any, Optional
from pydantic import Field, model_validator
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
    start_time: Optional[datetime] = Field(None, alias="start_time_utc")
    end_time: Optional[datetime] = Field(None, alias="end_time_utc")
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_times(cls, data: Any) -> Any:
        if isinstance(data, dict):
            now = datetime.now(timezone.utc)
            duration = data.get("duration_minutes") or data.get("durationMinutes")
            if "start_time" not in data and "start_time_utc" not in data and "startTime" not in data:
                if duration:
                    data["start_time"] = now - timedelta(minutes=float(duration))
                else:
                    data["start_time"] = now
            if "end_time" not in data and "end_time_utc" not in data and "endTime" not in data:
                data["end_time"] = now
            if duration and "duration_minutes" not in data:
                data["duration_minutes"] = int(duration)
        return data
