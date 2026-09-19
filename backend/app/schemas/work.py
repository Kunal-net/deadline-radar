from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import Field
from app.schemas.common import AppBaseModel, PaginatedResponse


class InitialUnitCreate(AppBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    estimated_hours: float = Field(default=1.0, ge=0.1, le=100.0)


class WorkItemCreateRequest(AppBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(default="academic", max_length=64)
    deadline_utc: Optional[datetime] = Field(None, alias="deadline")
    is_hard_deadline: bool = True
    importance_weight: float = Field(default=1.0, ge=0.5, le=3.0)
    estimated_hours: float = Field(default=0.0, ge=0.0)
    initial_units: Optional[List[InitialUnitCreate]] = Field(None, alias="units")


class WorkItemUpdateRequest(AppBaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    deadline_utc: Optional[datetime] = None
    is_hard_deadline: Optional[bool] = None
    importance_weight: Optional[float] = Field(None, ge=0.5, le=3.0)
    status: Optional[str] = None
    total_estimated_hours: Optional[float] = Field(None, ge=0.0)
    remaining_estimated_hours: Optional[float] = Field(None, ge=0.0)


class WorkUnitCreateRequest(AppBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    sequence_order: int = Field(default=1, ge=1)
    estimated_hours: float = Field(default=1.0, ge=0.1, le=100.0)


class WorkUnitUpdateRequest(AppBaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sequence_order: Optional[int] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    is_completed: Optional[bool] = None
    is_user_verified: Optional[bool] = None


class UnitOrderItem(AppBaseModel):
    unit_id: str
    sequence_order: int


class UnitReorderRequest(AppBaseModel):
    unit_orders: List[UnitOrderItem]


class WorkUnitResponse(AppBaseModel):
    id: str
    work_item_id: str
    title: str
    description: Optional[str] = None
    sequence_order: int
    is_completed: bool
    completed_at: Optional[str] = None
    estimated_hours: float
    actual_hours: float
    is_user_verified: bool


class WorkItemResponse(AppBaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    status: str
    importance_weight: float
    deadline_utc: Optional[str] = None
    is_hard_deadline: bool
    total_estimated_hours: float
    remaining_estimated_hours: float
    total_actual_hours: float
    completion_pct: int
    risk_state: str
    risk_ratio: float
    dynamic_priority: float
    priority_explanation: Optional[str] = None
    units_count: int = 0
    completed_units_count: int = 0
    units: Optional[List[WorkUnitResponse]] = None
    created_at: str
    updated_at: str


class WorkUnitsListResponse(AppBaseModel):
    units: List[WorkUnitResponse]
