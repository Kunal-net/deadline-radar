from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta, timezone
from typing import Dict, List, Optional


@dataclass
class AvailabilitySlot:
    day_of_week: int  # 0=Sunday .. 6=Saturday
    start_time: str   # "18:00:00"
    end_time: str     # "22:00:00"
    capacity_hours: float
    is_available: bool = True


@dataclass
class BlackoutWindow:
    start_time: datetime
    end_time: datetime
    is_blackout: bool = True
    title: Optional[str] = None


@dataclass
class RiskAssessmentResult:
    risk_state: str  # "safe", "watch", "at_risk", "critical", "overdue"
    risk_ratio: float
    remaining_effort_hours: float
    suitable_capacity_hours: float
    deficit_surplus_hours: float
    buffer_hours: float
    deadline_distance_hours: float
    contributing_factors: List[str] = field(default_factory=list)
    calculated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class DeadlineRiskEngine:
    """
    Deterministic Deadline Risk Engine.
    Compares remaining required effort against remaining suitable available capacity.
    No probabilistic LLMs are used for this calculation.
    """

    @staticmethod
    def calculate_risk(
        remaining_effort_hours: float,
        deadline_utc: Optional[datetime],
        current_time_utc: datetime,
        availability_templates: List[AvailabilitySlot],
        blackouts: List[BlackoutWindow],
        buffer_percentage: float = 20.0,
        pace_factor: float = 1.0,
        is_completed: bool = False,
    ) -> RiskAssessmentResult:
        now = current_time_utc
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)

        # 1. Edge Case: Completed Work
        if is_completed or remaining_effort_hours <= 0.0:
            return RiskAssessmentResult(
                risk_state="safe",
                risk_ratio=0.0,
                remaining_effort_hours=0.0,
                suitable_capacity_hours=0.0,
                deficit_surplus_hours=0.0,
                buffer_hours=0.0,
                deadline_distance_hours=0.0,
                contributing_factors=["Work item is completed or has zero remaining effort."],
            )

        # 2. Edge Case: No Deadline
        if deadline_utc is None:
            return RiskAssessmentResult(
                risk_state="safe",
                risk_ratio=0.0,
                remaining_effort_hours=remaining_effort_hours,
                suitable_capacity_hours=999.0,
                deficit_surplus_hours=999.0,
                buffer_hours=0.0,
                deadline_distance_hours=999.0,
                contributing_factors=["No deadline specified; work is self-paced."],
            )

        deadline = deadline_utc
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        # 3. Edge Case: Overdue (Deadline in the past)
        distance_hours = (deadline - now).total_seconds() / 3600.0
        if distance_hours <= 0.0:
            return RiskAssessmentResult(
                risk_state="overdue",
                risk_ratio=9.99,
                remaining_effort_hours=remaining_effort_hours,
                suitable_capacity_hours=0.0,
                deficit_surplus_hours=-remaining_effort_hours,
                buffer_hours=0.0,
                deadline_distance_hours=round(distance_hours, 1),
                contributing_factors=[
                    f"Deadline passed {abs(distance_hours):.1f} hours ago with {remaining_effort_hours:.1f}h work remaining."
                ],
            )

        # 4. Adjusted Effort via Personal Pace Factor
        adjusted_effort = remaining_effort_hours * pace_factor
        factors: List[str] = [
            f"Nominal remaining effort: {remaining_effort_hours:.1f}h (adjusted: {adjusted_effort:.1f}h via pace factor {pace_factor:.2f})"
            if pace_factor != 1.0
            else f"Remaining effort: {remaining_effort_hours:.1f}h"
        ]

        # 5. Compute Suitable Capacity before Deadline
        total_raw_capacity = 0.0
        blackout_deductions = 0.0
        template_map: Dict[int, List[AvailabilitySlot]] = {}
        for t in availability_templates:
            if t.is_available:
                template_map.setdefault(t.day_of_week, []).append(t)

        current_day = now.date()
        deadline_day = deadline.date()
        step_day = current_day

        while step_day <= deadline_day:
            day_of_week = (step_day.weekday() + 1) % 7  # Convert Monday=0 to Sunday=0 convention
            day_templates = template_map.get(day_of_week, [])

            for slot in day_templates:
                try:
                    start_parts = [int(p) for p in slot.start_time.split(":")[:2]]
                    end_parts = [int(p) for p in slot.end_time.split(":")[:2]]
                    slot_start = datetime(
                        step_day.year, step_day.month, step_day.day,
                        start_parts[0], start_parts[1], tzinfo=timezone.utc
                    )
                    slot_end = datetime(
                        step_day.year, step_day.month, step_day.day,
                        end_parts[0], end_parts[1], tzinfo=timezone.utc
                    )
                except Exception:
                    continue

                # Clip slot by current time and deadline
                effective_start = max(slot_start, now)
                effective_end = min(slot_end, deadline)

                if effective_end > effective_start:
                    slot_hours = (effective_end - effective_start).total_seconds() / 3600.0
                    total_raw_capacity += slot_hours

                    # Check for overlapping blackouts
                    for b in blackouts:
                        if not b.is_blackout:
                            continue
                        b_start = b.start_time if b.start_time.tzinfo else b.start_time.replace(tzinfo=timezone.utc)
                        b_end = b.end_time if b.end_time.tzinfo else b.end_time.replace(tzinfo=timezone.utc)
                        overlap_start = max(effective_start, b_start)
                        overlap_end = min(effective_end, b_end)
                        if overlap_end > overlap_start:
                            b_hours = (overlap_end - overlap_start).total_seconds() / 3600.0
                            blackout_deductions += b_hours

            step_day += timedelta(days=1)

        net_capacity = max(0.0, total_raw_capacity - blackout_deductions)

        # Apply buffer percentage deduction (e.g. 20% reserve for breaks/fatigue)
        buffer_ratio = max(0.0, min(buffer_percentage / 100.0, 0.5))
        buffer_hours = round(net_capacity * buffer_ratio, 2)
        suitable_capacity = max(0.0, round(net_capacity - buffer_hours, 2))

        factors.append(
            f"Gross available capacity: {total_raw_capacity:.1f}h before deadline."
        )
        if blackout_deductions > 0:
            blackout_titles = [b.title for b in blackouts if b.title and b.is_blackout]
            if blackout_titles:
                factors.append(
                    f"Deducted {blackout_deductions:.1f}h for overlapping commitments: {', '.join(blackout_titles)}."
                )
            else:
                factors.append(
                    f"Deducted {blackout_deductions:.1f}h for overlapping schedule commitments/blackouts."
                )
        factors.append(
            f"Applied {buffer_percentage:.0f}% safety buffer ({buffer_hours:.1f}h), leaving {suitable_capacity:.1f}h suitable focus capacity."
        )

        # 6. Calculate Risk Ratio
        if suitable_capacity <= 0.0:
            risk_ratio = 9.99
            risk_state = "critical"
            factors.append("Zero suitable capacity available before deadline.")
        else:
            risk_ratio = round(adjusted_effort / suitable_capacity, 2)
            if risk_ratio >= 1.5:
                risk_state = "critical"
            elif risk_ratio >= 1.0:
                risk_state = "at_risk"
            elif risk_ratio >= 0.7:
                risk_state = "watch"
            else:
                risk_state = "safe"

        deficit_surplus = round(suitable_capacity - adjusted_effort, 2)
        if deficit_surplus < 0:
            factors.append(f"Capacity deficit of {abs(deficit_surplus):.1f}h.")
        else:
            factors.append(f"Capacity surplus of {deficit_surplus:.1f}h.")

        return RiskAssessmentResult(
            risk_state=risk_state,
            risk_ratio=risk_ratio,
            remaining_effort_hours=round(remaining_effort_hours, 2),
            suitable_capacity_hours=suitable_capacity,
            deficit_surplus_hours=deficit_surplus,
            buffer_hours=buffer_hours,
            deadline_distance_hours=round(distance_hours, 1),
            contributing_factors=factors,
        )
