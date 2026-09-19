from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import Field
from app.schemas.common import AppBaseModel


class AvailabilityTemplateItem(AppBaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    is_available: bool = True
    capacity_hours: float = Field(..., ge=0.0, le=24.0)


class AvailabilityTemplateResponse(AppBaseModel):
    id: str
    day_of_week: int
    start_time: str
    end_time: str
    is_available: bool
    capacity_hours: float


class AvailabilityTemplatesListResponse(AppBaseModel):
    templates: List[AvailabilityTemplateResponse]


class AvailabilityTemplatesUpdateRequest(AppBaseModel):
    templates: List[AvailabilityTemplateItem]


class ScheduleBlockCreateRequest(AppBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    block_type: str = Field(default="hard_commitment", max_length=64)
    interest_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_blackout: bool = True


class ScheduleBlockResponse(AppBaseModel):
    id: str
    title: str
    block_type: str
    interest_id: Optional[str] = None
    start_time: str
    end_time: str
    is_blackout: bool


class ScheduleBlocksListResponse(AppBaseModel):
    blocks: List[ScheduleBlockResponse]
