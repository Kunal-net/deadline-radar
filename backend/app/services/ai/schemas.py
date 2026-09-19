from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExtractedSubtask(BaseModel):
    sequence_order: int
    title: str
    estimated_hours: float = 1.0


class WorkInterpretationRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=2000)
    context_date: Optional[str] = None  # ISO date or YYYY-MM-DD for relative date resolution


class WorkInterpretationResponse(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "academic"  # academic, project, exam_prep, career, administrative, personal
    deadline_utc: Optional[str] = None  # ISO 8601 UTC
    is_hard_deadline: bool = True
    estimated_hours: float = 2.0
    deliverable: Optional[str] = None
    constraints: List[str] = []
    suggested_subtasks: List[ExtractedSubtask] = []
    missing_information: List[str] = []
    confidence_score: float = 0.85


class DecompositionRequest(BaseModel):
    work_title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    category: str = "academic"
    deadline_utc: Optional[str] = None
    estimated_hours: Optional[float] = None


class SuggestedUnit(BaseModel):
    sequence_order: int
    title: str
    description: Optional[str] = None
    estimated_hours: float = 1.0


class DecompositionResponse(BaseModel):
    suggested_units: List[SuggestedUnit] = []
    total_estimated_hours: float
    confidence_score: float = 0.85
    decomposition_notes: Optional[str] = None


class EffortEstimationRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    category: str = "academic"
    complexity: Optional[str] = "moderate"  # simple, moderate, complex, massive
    units_count: Optional[int] = None


class EffortEstimationResponse(BaseModel):
    baseline_hours: float
    min_expected_hours: float
    max_expected_hours: float
    confidence_score: float = 0.80
    estimation_rationale: str


class ExplanationRequest(BaseModel):
    work_id: Optional[str] = None
    title: str
    risk_state: str  # safe, watch, at_risk, critical, overdue
    risk_ratio: float
    dynamic_priority: float
    remaining_hours: float
    available_hours: float
    days_until_deadline: Optional[float] = None
    factors: List[str] = []


class ExplanationResponse(BaseModel):
    summary: str
    risk_explanation: str
    priority_explanation: str
    actionable_recommendations: List[str] = []


class PlanningAssistanceRequest(BaseModel):
    date: str
    available_capacity_hours: float
    allocated_hours: float
    top_items: List[Dict[str, Any]] = []
    conflicts: List[str] = []


class PlanningAssistanceResponse(BaseModel):
    advice: str
    suggested_adjustments: List[str] = []
    focus_strategy: str
