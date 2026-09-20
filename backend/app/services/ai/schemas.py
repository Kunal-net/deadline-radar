from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, computed_field, model_validator


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
    title: Optional[str] = None
    work_title: Optional[str] = None
    description: Optional[str] = None
    category: str = "academic"
    deadline_utc: Optional[str] = None
    target_deadline: Optional[str] = None
    estimated_hours: Optional[float] = None

    @property
    def effective_title(self) -> str:
        t = self.title or self.work_title
        if not t:
            raise ValueError("Either 'title' or 'work_title' must be provided.")
        return t.strip()


class SuggestedUnit(BaseModel):
    sequence_order: int
    title: str
    description: Optional[str] = None
    estimated_hours: float = 1.0
    dependencies: List[int] = []


class DecompositionResponse(BaseModel):
    suggested_category: str = "academic"
    suggested_units: List[SuggestedUnit] = []
    total_estimated_hours: float
    confidence_score: float = 0.85
    reasoning_summary: Optional[str] = None
    decomposition_notes: Optional[str] = None
    detected_missing_information: List[str] = []


class ApplyDecompositionRequest(BaseModel):
    units: List[SuggestedUnit]
    replace_existing: bool = False


class EffortEstimationRequest(BaseModel):
    title: Optional[str] = None
    work_title: Optional[str] = None
    description: Optional[str] = None
    category: str = "academic"
    complexity: Optional[str] = "moderate"  # simple, moderate, complex, massive
    units_count: Optional[int] = None
    user_pace_factor: Optional[float] = None
    historical_observations_count: Optional[int] = 0

    @model_validator(mode="before")
    @classmethod
    def normalize_title(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "title" not in data and "work_title" in data:
                data["title"] = data["work_title"]
            elif "work_title" not in data and "title" in data:
                data["work_title"] = data["title"]
        return data

    @property
    def effective_title(self) -> str:
        t = self.title or self.work_title
        if not t:
            raise ValueError("Either 'title' or 'work_title' must be provided.")
        return t.strip()


class EffortEstimationResponse(BaseModel):
    baseline_estimated_hours: float
    user_pace_factor: float = 1.0
    adjusted_estimated_hours: float
    min_expected_hours: float
    max_expected_hours: float
    likely_range: str
    confidence_score: float = 0.80
    confidence_level: str = "medium"  # low, medium, high
    major_factors: List[str] = []
    estimation_source: str = "hybrid_heuristic_calibrated"
    model_metadata: str = "DeadlineRadar-Estimator-v1.0"
    estimation_rationale: str
    explanation: str
    is_personalized: bool = False
    is_guarantee: bool = False

    @property
    def baseline_hours(self) -> float:
        return self.baseline_estimated_hours

    @computed_field
    def estimated_hours(self) -> float:
        return self.adjusted_estimated_hours

    @computed_field
    def suggested_range_min_hours(self) -> float:
        return self.min_expected_hours

    @computed_field
    def suggested_range_max_hours(self) -> float:
        return self.max_expected_hours

    @computed_field
    def reasoning(self) -> str:
        return self.estimation_rationale

    @computed_field
    def variance_risk(self) -> str:
        return self.likely_range


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
    variance_explanation: Optional[str] = None
    actionable_recommendations: List[str] = []
    grounded_metrics: Dict[str, Any] = {}

    @computed_field
    def contributing_factors(self) -> List[str]:
        factors = []
        if self.risk_explanation:
            factors.append(self.risk_explanation)
        if self.priority_explanation:
            factors.append(self.priority_explanation)
        return factors

    @computed_field
    def mitigations(self) -> List[str]:
        return self.actionable_recommendations

    @computed_field
    def tone(self) -> str:
        return "supportive"


class PlanningAssistanceRequest(BaseModel):
    date: str
    available_capacity_hours: float
    allocated_hours: float
    top_items: List[Dict[str, Any]] = []
    conflicts: List[str] = []


class PlanningAssistanceResponse(BaseModel):
    schedule_pressure: str = "balanced"  # relaxed, balanced, high_intensity, overloaded
    advice: str
    tradeoffs_summary: str = ""
    suggested_adjustments: List[str] = []
    sequencing_recommendations: List[str] = []
    potential_conflicts: List[str] = []
    focus_strategy: str
    is_validated_deterministic: bool = True

    @computed_field
    def recommendations(self) -> List[str]:
        return self.suggested_adjustments if self.suggested_adjustments else ([self.advice] if self.advice else [])

    @computed_field
    def pace_advisory(self) -> str:
        return self.focus_strategy

    @computed_field
    def pressure_tier(self) -> str:
        tier = self.schedule_pressure.lower()
        if "relax" in tier:
            return "relaxed"
        if "overload" in tier or "high" in tier:
            return "overloaded"
        return "balanced"

    @computed_field
    def warnings(self) -> List[str]:
        return self.potential_conflicts
