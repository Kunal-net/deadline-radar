from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, computed_field


class PlanItemResponse(BaseModel):
    id: str
    work_item_id: Optional[str] = None
    work_unit_id: Optional[str] = None
    title: str
    planned_start: Optional[str] = None
    planned_end: Optional[str] = None
    duration_minutes: int
    sequence_order: int
    status: str
    is_protected: bool = False
    notes: Optional[str] = None

    @computed_field
    def startTime(self) -> str:
        if self.planned_start:
            return self.planned_start.split("T")[-1][:5] if "T" in self.planned_start else self.planned_start[:5]
        return "09:00"

    @computed_field
    def endTime(self) -> str:
        if self.planned_end:
            return self.planned_end.split("T")[-1][:5] if "T" in self.planned_end else self.planned_end[:5]
        return "10:30"

    @computed_field
    def durationHours(self) -> float:
        return round(self.duration_minutes / 60.0, 1)

    @computed_field
    def workItemId(self) -> Optional[str]:
        return self.work_item_id

    @computed_field
    def isProtected(self) -> bool:
        return self.is_protected


class PlanResponse(BaseModel):
    id: str
    plan_date: str
    total_planned_minutes: int
    total_completed_minutes: int
    is_finalized: bool
    items: List[PlanItemResponse] = []


class PlanGenerateRequest(BaseModel):
    target_date: Optional[str] = None  # YYYY-MM-DD
    max_hours: Optional[float] = Field(None, ge=0.5, le=24.0)
    include_interests: bool = True


class PlanGenerateResponse(BaseModel):
    plan: PlanResponse


class PlanItemUpdateRequest(BaseModel):
    status: Optional[str] = None  # pending, in_progress, completed, dismissed, rescheduled
    notes: Optional[str] = None
    sequence_order: Optional[int] = None


class RecommendationItem(BaseModel):
    work_item_id: Optional[str] = None
    title: str
    duration_minutes: int
    reason: Optional[str] = None
    planned_start: Optional[str] = None


class TodayOverviewResponse(BaseModel):
    date: str
    active_session: Optional[Dict[str, Any]] = None
    now_recommendation: Optional[RecommendationItem] = None
    next_recommendation: Optional[RecommendationItem] = None
    urgent_deadlines_count: int = 0
    day_capacity_hours: float = 0.0
    day_allocated_hours: float = 0.0
    today_plan_items: List[PlanItemResponse] = []

    @computed_field
    def dateDisplay(self) -> str:
        try:
            from datetime import date as d_cls
            dt = d_cls.fromisoformat(self.date)
            return dt.strftime("%A, %b %d, %Y")
        except Exception:
            return self.date

    @computed_field
    def issueNumber(self) -> str:
        return "N° 042"

    @computed_field
    def availableFocusHours(self) -> float:
        return self.day_capacity_hours

    @computed_field
    def deadlinesCount(self) -> int:
        return self.urgent_deadlines_count

    @computed_field
    def maxFocusLimitHours(self) -> float:
        return max(6.0, round(self.day_capacity_hours * 1.25, 1))

    @computed_field
    def planItems(self) -> List[PlanItemResponse]:
        return self.today_plan_items

