from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import Field, computed_field, model_validator
from app.schemas.common import AppBaseModel, PaginatedResponse
from typing import Any, Dict


class InitialUnitCreate(AppBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    estimated_hours: float = Field(default=1.0, ge=0.1, le=100.0)

    @model_validator(mode="before")
    @classmethod
    def normalize_unit(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "estimatedHours" in data and "estimated_hours" not in data:
                data["estimated_hours"] = data["estimatedHours"]
            elif "estimatedMinutes" in data and "estimated_hours" not in data:
                data["estimated_hours"] = max(0.1, round(float(data["estimatedMinutes"]) / 60.0, 2))
        return data


class WorkItemCreateRequest(AppBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(default="academic", max_length=64)
    deadline_utc: Optional[datetime] = Field(None, alias="deadline")
    is_hard_deadline: bool = True
    importance_weight: float = Field(default=1.0, ge=0.5, le=3.0)
    estimated_hours: float = Field(default=0.0, ge=0.0)
    initial_units: Optional[List[InitialUnitCreate]] = Field(None, alias="units")

    @model_validator(mode="before")
    @classmethod
    def normalize_create(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "deadlineUtc" in data and "deadline_utc" not in data and "deadline" not in data:
                data["deadline_utc"] = data["deadlineUtc"]
            if "isHardDeadline" in data and "is_hard_deadline" not in data:
                data["is_hard_deadline"] = data["isHardDeadline"]
            if "estimatedEffortHours" in data and "estimated_hours" not in data:
                data["estimated_hours"] = data["estimatedEffortHours"]
            if "estimatedHours" in data and "estimated_hours" not in data:
                data["estimated_hours"] = data["estimatedHours"]
            if "initialUnits" in data and "initial_units" not in data and "units" not in data:
                data["initial_units"] = data["initialUnits"]
        return data


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

    @model_validator(mode="before")
    @classmethod
    def normalize_update(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "deadlineUtc" in data and "deadline_utc" not in data:
                data["deadline_utc"] = data["deadlineUtc"]
            if "isHardDeadline" in data and "is_hard_deadline" not in data:
                data["is_hard_deadline"] = data["isHardDeadline"]
            if "importanceWeight" in data and "importance_weight" not in data:
                data["importance_weight"] = data["importanceWeight"]
            if "estimatedEffortHours" in data and "total_estimated_hours" not in data:
                data["total_estimated_hours"] = data["estimatedEffortHours"]
            if "totalEstimatedHours" in data and "total_estimated_hours" not in data:
                data["total_estimated_hours"] = data["totalEstimatedHours"]
            if "remainingEffortHours" in data and "remaining_estimated_hours" not in data:
                data["remaining_estimated_hours"] = data["remainingEffortHours"]
            if "remainingEstimatedHours" in data and "remaining_estimated_hours" not in data:
                data["remaining_estimated_hours"] = data["remainingEstimatedHours"]
        return data


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

    @computed_field
    def estimated_minutes(self) -> int:
        return int(self.estimated_hours * 60)

    @computed_field
    def completed_minutes(self) -> int:
        return int(self.actual_hours * 60)

    @computed_field
    def order_index(self) -> int:
        return self.sequence_order

    @computed_field
    def workItemId(self) -> str:
        return self.work_item_id

    @computed_field
    def isCompleted(self) -> bool:
        return self.is_completed

    @computed_field
    def estimatedMinutes(self) -> int:
        return int(self.estimated_hours * 60)

    @computed_field
    def completedMinutes(self) -> int:
        return int(self.actual_hours * 60)

    @computed_field
    def orderIndex(self) -> int:
        return self.sequence_order


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

    @computed_field
    def remaining_effort_hours(self) -> float:
        return self.remaining_estimated_hours

    @computed_field
    def estimated_effort_hours(self) -> float:
        return self.total_estimated_hours

    @computed_field
    def actual_logged_hours(self) -> float:
        return self.total_actual_hours

    @computed_field
    def dynamic_priority_score(self) -> float:
        return self.dynamic_priority

    @computed_field
    def risk_level(self) -> str:
        return self.risk_state.upper()

    @computed_field
    def deadlineUtc(self) -> Optional[str]:
        return self.deadline_utc

    @computed_field
    def isHardDeadline(self) -> bool:
        return self.is_hard_deadline

    @computed_field
    def estimatedEffortHours(self) -> float:
        return self.total_estimated_hours

    @computed_field
    def remainingEffortHours(self) -> float:
        return self.remaining_estimated_hours

    @computed_field
    def actualLoggedHours(self) -> float:
        return self.total_actual_hours

    @computed_field
    def dynamicPriorityScore(self) -> float:
        return self.dynamic_priority

    @computed_field
    def riskLevel(self) -> str:
        return self.risk_state.upper()

    @computed_field
    def createdAt(self) -> str:
        return self.created_at

    @computed_field
    def updatedAt(self) -> str:
        return self.updated_at


class WorkUnitsListResponse(AppBaseModel):
    units: List[WorkUnitResponse]
