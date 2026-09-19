from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


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
