from __future__ import annotations

from typing import List, Optional
from app.schemas.common import AppBaseModel


class CategoryPaceBreakdown(AppBaseModel):
    category: str
    pace_factor: float
    sample_count: int
    confidence: float
    interpretation: str


class InsightsSummaryResponse(AppBaseModel):
    overall_pace_factor: float
    confidence_level: str  # low, medium, high
    total_completed_tasks: int
    total_tracked_hours: float
    estimation_accuracy_pct: int
    average_signed_error_hours: float
    average_absolute_error_hours: float
    rolling_bias: str  # underestimating, accurate, overestimating
    category_breakdowns: List[CategoryPaceBreakdown]
    learning_status: str  # cold_start, calibrating, calibrated


class RecalibratePaceResponse(AppBaseModel):
    updated_categories: int
    overall_pace_factor: float
    observations_processed: int
    learning_status: str
    message: str
