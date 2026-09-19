from __future__ import annotations

from typing import Dict, List, Optional
from pydantic import Field, computed_field
from app.schemas.common import AppBaseModel


class CriticalItemSummary(AppBaseModel):
    id: str
    title: str
    deadline_utc: Optional[str] = None
    remaining_estimated_hours: float
    available_hours_before_deadline: float
    risk_state: str
    risk_ratio: float

    @computed_field
    def deadlineUtc(self) -> Optional[str]:
        return self.deadline_utc

    @computed_field
    def remainingEstimatedHours(self) -> float:
        return self.remaining_estimated_hours

    @computed_field
    def availableHoursBeforeDeadline(self) -> float:
        return self.available_hours_before_deadline

    @computed_field
    def riskState(self) -> str:
        return self.risk_state

    @computed_field
    def riskRatio(self) -> float:
        return self.risk_ratio


class CapacityMetricSummary(AppBaseModel):
    available_focus_hours: float
    committed_work_hours: float
    net_buffer_hours: float
    risk_assessment: str
    week_number: int

    @computed_field
    def availableFocusHours(self) -> float:
        return self.available_focus_hours

    @computed_field
    def committedWorkHours(self) -> float:
        return self.committed_work_hours

    @computed_field
    def netBufferHours(self) -> float:
        return self.net_buffer_hours

    @computed_field
    def riskAssessment(self) -> str:
        return self.risk_assessment

    @computed_field
    def weekNumber(self) -> int:
        return self.week_number


class DashboardSummaryResponse(AppBaseModel):
    risk_counts: Dict[str, int] = Field(default_factory=dict)
    critical_items: List[CriticalItemSummary] = Field(default_factory=list)
    week_workload_hours: float = 0.0
    week_capacity_hours: float = 0.0
    capacity_status: str = "balanced"
    capacity_metric: Optional[CapacityMetricSummary] = None

    @computed_field
    def riskCounts(self) -> Dict[str, int]:
        return self.risk_counts

    @computed_field
    def criticalItems(self) -> List[CriticalItemSummary]:
        return self.critical_items

    @computed_field
    def weekWorkloadHours(self) -> float:
        return self.week_workload_hours

    @computed_field
    def weekCapacityHours(self) -> float:
        return self.week_capacity_hours

    @computed_field
    def capacityStatus(self) -> str:
        return self.capacity_status

    @computed_field
    def capacityMetric(self) -> Optional[CapacityMetricSummary]:
        return self.capacity_metric


class TimelineSlot(AppBaseModel):
    date: str
    hours: float


class TimelineItemProjection(AppBaseModel):
    work_item_id: str
    title: str
    category: str
    risk_state: str
    deadline_utc: Optional[str] = None
    remaining_estimated_hours: float
    projected_completion_utc: Optional[str] = None
    is_projected_late: bool
    allocated_slots: List[TimelineSlot] = Field(default_factory=list)

    @computed_field
    def workItemId(self) -> str:
        return self.work_item_id

    @computed_field
    def riskState(self) -> str:
        return self.risk_state

    @computed_field
    def deadlineUtc(self) -> Optional[str]:
        return self.deadline_utc

    @computed_field
    def remainingEstimatedHours(self) -> float:
        return self.remaining_estimated_hours

    @computed_field
    def projectedCompletionUtc(self) -> Optional[str]:
        return self.projected_completion_utc

    @computed_field
    def isProjectedLate(self) -> bool:
        return self.is_projected_late

    @computed_field
    def allocatedSlots(self) -> List[TimelineSlot]:
        return self.allocated_slots


class TimelineWindow(AppBaseModel):
    start_date: str
    end_date: str

    @computed_field
    def startDate(self) -> str:
        return self.start_date

    @computed_field
    def endDate(self) -> str:
        return self.end_date


class TimelineProjectionResponse(AppBaseModel):
    timeline_window: TimelineWindow
    items: List[TimelineItemProjection] = Field(default_factory=list)

    @computed_field
    def timelineWindow(self) -> TimelineWindow:
        return self.timeline_window


class WorkloadPeriod(AppBaseModel):
    date_label: str
    day_of_week: str
    capacity_hours: float
    demand_hours: float
    utilization_percentage: float
    is_overloaded: bool

    @computed_field
    def dateLabel(self) -> str:
        return self.date_label

    @computed_field
    def dayOfWeek(self) -> str:
        return self.day_of_week

    @computed_field
    def capacityHours(self) -> float:
        return self.capacity_hours

    @computed_field
    def demandHours(self) -> float:
        return self.demand_hours

    @computed_field
    def utilizationPercentage(self) -> float:
        return self.utilization_percentage

    @computed_field
    def isOverloaded(self) -> bool:
        return self.is_overloaded


class WorkloadCapacityResponse(AppBaseModel):
    periods: List[WorkloadPeriod] = Field(default_factory=list)
