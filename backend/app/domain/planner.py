from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Dict, List, Optional


@dataclass
class PlannedBlock:
    title: str
    start_dt: datetime
    end_dt: datetime
    duration_minutes: int
    sequence_order: int
    work_item_id: Optional[str] = None
    work_unit_id: Optional[str] = None
    is_protected: bool = False
    reason: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DailyPlannerResult:
    target_date: date
    total_planned_minutes: int
    available_capacity_minutes: int
    planned_blocks: List[PlannedBlock] = field(default_factory=list)
    feasibility_valid: bool = True
    feasibility_notes: List[str] = field(default_factory=list)


@dataclass
class TimeSlot:
    start_dt: datetime
    end_dt: datetime

    @property
    def duration_minutes(self) -> int:
        return max(0, int((self.end_dt - self.start_dt).total_seconds() / 60.0))


@dataclass
class CandidateWork:
    item_id: str
    title: str
    priority_score: float
    remaining_hours: float
    deadline_utc: Optional[datetime] = None
    unit_id: Optional[str] = None
    unit_title: Optional[str] = None
    is_blocked: bool = False


class DailyPlanner:
    """
    Deterministic Capacity-Aware Daily Planning Engine for Deadline Radar.
    
    Allocates target date available focus capacity to top-priority work items
    while strictly protecting scheduled commitments and personal interests.
    Validates feasibility to prevent impossible schedules.
    """

    @classmethod
    def generate_plan(
        cls,
        target_date: date,
        available_slots: List[tuple[time, time]],  # Day's template intervals (start_time, end_time)
        blackout_blocks: List[tuple[time, time, str]],  # (start_time, end_time, title)
        candidate_work: List[CandidateWork],  # Pre-ranked candidate items/units
        personal_interests: Optional[List[tuple[str, int]]] = None,  # (name, minutes)
        max_hours: Optional[float] = None,
        include_interests: bool = True,
        pace_factor: float = 1.0,
    ) -> DailyPlannerResult:
        notes: List[str] = []

        # 1. Compute Free Disjoint Time Slots for target_date
        free_slots = cls._compute_free_slots(target_date, available_slots, blackout_blocks)
        total_available_minutes = sum(s.duration_minutes for s in free_slots)
        notes.append(f"Computed {len(free_slots)} available focus slots totaling {total_available_minutes} minutes.")

        # Cap capacity if requested by user
        if max_hours is not None:
            user_cap_minutes = int(max_hours * 60.0)
            planning_budget_minutes = min(total_available_minutes, user_cap_minutes)
            notes.append(f"Applied user daily cap of {max_hours:.1f}h ({planning_budget_minutes}m budget).")
        else:
            planning_budget_minutes = total_available_minutes

        remaining_budget_minutes = planning_budget_minutes
        planned_blocks: List[PlannedBlock] = []
        sequence_order = 1

        # 2. Schedule Protected Personal Interests First (if requested)
        if include_interests and personal_interests:
            for interest_name, duration_min in personal_interests:
                if remaining_budget_minutes < 30 or not free_slots:
                    break
                alloc_min = min(duration_min, remaining_budget_minutes)
                # Find a slot that can fit this interest
                placed_slot = cls._allocate_into_slots(free_slots, alloc_min)
                if placed_slot:
                    start_dt, end_dt = placed_slot
                    planned_blocks.append(
                        PlannedBlock(
                            title=f"{interest_name} (Protected)",
                            start_dt=start_dt,
                            end_dt=end_dt,
                            duration_minutes=alloc_min,
                            sequence_order=sequence_order,
                            is_protected=True,
                            reason="Protected personal interest to maintain well-being and prevent burnout.",
                            metadata={"type": "personal_interest"},
                        )
                    )
                    sequence_order += 1
                    remaining_budget_minutes -= alloc_min
                    notes.append(f"Reserved {alloc_min}m for protected interest: {interest_name}.")

        # 3. Schedule Top-Priority Work Units / Items
        for cand in candidate_work:
            if remaining_budget_minutes < 20 or not free_slots:
                break
            if cand.is_blocked:
                continue
            if cand.remaining_hours <= 0:
                continue

            # Scale needed minutes by user pace factor
            pace_adjusted_min = int(cand.remaining_hours * 60.0 * max(0.5, min(2.0, pace_factor)))
            # Allocate chunk size between 30 and 90 minutes
            chunk_minutes = max(30, min(90, pace_adjusted_min, remaining_budget_minutes))

            # Try to place into free slots
            placed_slot = cls._allocate_into_slots(free_slots, chunk_minutes)
            if placed_slot:
                start_dt, end_dt = placed_slot
                display_title = (
                    f"{cand.title} — {cand.unit_title}"
                    if cand.unit_title
                    else cand.title
                )
                reason = f"Top priority task (Priority {cand.priority_score:.1f}) scheduled into focus window."
                if cand.deadline_utc:
                    reason += f" Deadline: {cand.deadline_utc.strftime('%Y-%m-%d %H:%M UTC')}."

                planned_blocks.append(
                    PlannedBlock(
                        title=display_title,
                        start_dt=start_dt,
                        end_dt=end_dt,
                        duration_minutes=chunk_minutes,
                        sequence_order=sequence_order,
                        work_item_id=cand.item_id,
                        work_unit_id=cand.unit_id,
                        is_protected=False,
                        reason=reason,
                        metadata={
                            "priority_score": cand.priority_score,
                            "pace_factor": pace_factor,
                            "remaining_hours": cand.remaining_hours,
                        },
                    )
                )
                sequence_order += 1
                remaining_budget_minutes -= chunk_minutes

        # 4. Sort Planned Blocks Chronologically
        planned_blocks.sort(key=lambda b: b.start_dt)
        for i, b in enumerate(planned_blocks, 1):
            b.sequence_order = i

        total_planned_minutes = sum(b.duration_minutes for b in planned_blocks)

        # 5. Validate Feasibility
        feasibility_valid, feasibility_errors = cls._validate_feasibility(
            planned_blocks, blackout_blocks, target_date, total_available_minutes
        )
        notes.extend(feasibility_errors)

        return DailyPlannerResult(
            target_date=target_date,
            total_planned_minutes=total_planned_minutes,
            available_capacity_minutes=total_available_minutes,
            planned_blocks=planned_blocks,
            feasibility_valid=feasibility_valid,
            feasibility_notes=notes,
        )

    @staticmethod
    def _to_time(val: Any) -> time:
        if isinstance(val, time):
            return val
        if isinstance(val, str):
            parts = val.split(":")
            h = int(parts[0])
            m = int(parts[1]) if len(parts) > 1 else 0
            s = int(parts[2].split(".")[0]) if len(parts) > 2 else 0
            return time(h, m, s)
        return time(9, 0)

    @classmethod
    def _compute_free_slots(
        cls,
        target_date: date,
        available_slots: List[tuple[Any, Any]],
        blackout_blocks: List[tuple[Any, Any, str]],
    ) -> List[TimeSlot]:
        """
        Creates disjoint, non-overlapping free time slots by taking available templates
        and subtracting any blackout commitments.
        """
        if not available_slots:
            # Fallback default: 09:00 to 17:00
            available_slots = [(time(9, 0), time(17, 0))]

        # Convert template intervals to datetime TimeSlots
        intervals: List[TimeSlot] = []
        for start_val, end_val in available_slots:
            start_t = cls._to_time(start_val)
            end_t = cls._to_time(end_val)
            s_dt = datetime.combine(target_date, start_t).replace(tzinfo=timezone.utc)
            e_dt = datetime.combine(target_date, end_t).replace(tzinfo=timezone.utc)
            if e_dt > s_dt:
                intervals.append(TimeSlot(start_dt=s_dt, end_dt=e_dt))

        # Subtract each blackout block
        for b_start, b_end, _ in blackout_blocks:
            b_s_dt = datetime.combine(target_date, cls._to_time(b_start)).replace(tzinfo=timezone.utc)
            b_e_dt = datetime.combine(target_date, cls._to_time(b_end)).replace(tzinfo=timezone.utc)

            next_intervals: List[TimeSlot] = []
            for slot in intervals:
                # Disjoint: slot is entirely before blackout or entirely after
                if slot.end_dt <= b_s_dt or slot.start_dt >= b_e_dt:
                    next_intervals.append(slot)
                else:
                    # Overlap: may produce left remnant and/or right remnant
                    if slot.start_dt < b_s_dt:
                        next_intervals.append(TimeSlot(start_dt=slot.start_dt, end_dt=b_s_dt))
                    if slot.end_dt > b_e_dt:
                        next_intervals.append(TimeSlot(start_dt=b_e_dt, end_dt=slot.end_dt))
            intervals = next_intervals

        # Filter out negligible fragments (< 15 minutes)
        valid_slots = [s for s in intervals if s.duration_minutes >= 15]
        valid_slots.sort(key=lambda s: s.start_dt)
        return valid_slots

    @classmethod
    def _allocate_into_slots(
        cls,
        free_slots: List[TimeSlot],
        needed_minutes: int,
    ) -> Optional[tuple[datetime, datetime]]:
        """
        Finds the first slot that can accommodate up to needed_minutes and trims it.
        Returns (start_dt, end_dt).
        """
        for i, slot in enumerate(free_slots):
            if slot.duration_minutes >= needed_minutes:
                alloc_start = slot.start_dt
                alloc_end = alloc_start + timedelta(minutes=needed_minutes)
                # Trim the slot
                slot.start_dt = alloc_end
                if slot.duration_minutes < 15:
                    free_slots.pop(i)
                return alloc_start, alloc_end
            elif slot.duration_minutes >= 30 and needed_minutes > slot.duration_minutes:
                # Take whatever the slot has if at least 30m
                alloc_start = slot.start_dt
                alloc_end = slot.end_dt
                free_slots.pop(i)
                return alloc_start, alloc_end

        return None

    @classmethod
    def _validate_feasibility(
        cls,
        planned_blocks: List[PlannedBlock],
        blackout_blocks: List[tuple[time, time, str]],
        target_date: date,
        total_available_minutes: int,
    ) -> tuple[bool, List[str]]:
        errors: List[str] = []

        # Check for overlapping blocks
        for i in range(len(planned_blocks) - 1):
            cur = planned_blocks[i]
            nxt = planned_blocks[i + 1]
            if cur.end_dt > nxt.start_dt:
                errors.append(
                    f"Feasibility error: block '{cur.title}' ({cur.end_dt}) overlaps with '{nxt.title}' ({nxt.start_dt})."
                )

        # Check for blackout collisions
        for b in planned_blocks:
            for b_start, b_end, b_title in blackout_blocks:
                b_s_dt = datetime.combine(target_date, cls._to_time(b_start)).replace(tzinfo=timezone.utc)
                b_e_dt = datetime.combine(target_date, cls._to_time(b_end)).replace(tzinfo=timezone.utc)
                if not (b.end_dt <= b_s_dt or b.start_dt >= b_e_dt):
                    errors.append(
                        f"Feasibility error: block '{b.title}' collides with commitment '{b_title}' ({b_start} - {b_end})."
                    )

        # Check total duration limit
        total_planned = sum(b.duration_minutes for b in planned_blocks)
        if total_planned > total_available_minutes:
            errors.append(
                f"Feasibility error: total planned duration ({total_planned}m) exceeds available capacity ({total_available_minutes}m)."
            )

        return (len(errors) == 0, errors)
