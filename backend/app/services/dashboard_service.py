from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.risk_engine import AvailabilitySlot, BlackoutWindow, DeadlineRiskEngine
from app.repositories.availability_repo import AvailabilityRepository
from app.repositories.work_repo import WorkItemRepository
from app.schemas.dashboard import (
    CapacityMetricSummary,
    CriticalItemSummary,
    DashboardSummaryResponse,
    TimelineItemProjection,
    TimelineProjectionResponse,
    TimelineSlot,
    TimelineWindow,
    WorkloadCapacityResponse,
    WorkloadPeriod,
)


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.work_repo = WorkItemRepository(db)
        self.avail_repo = AvailabilityRepository(db)

    async def _get_availability_context(self, user_id: str):
        raw_templates = await self.avail_repo.list_templates(user_id)
        raw_blocks = await self.avail_repo.list_blocks(user_id)

        templates: List[AvailabilitySlot] = []
        if raw_templates:
            for t in raw_templates:
                templates.append(
                    AvailabilitySlot(
                        day_of_week=t.day_of_week,
                        start_time=t.start_time,
                        end_time=t.end_time,
                        capacity_hours=t.capacity_hours,
                        is_available=t.is_available,
                    )
                )
        else:
            # Default fallback: 4 hours daily focus availability
            for day in range(7):
                templates.append(
                    AvailabilitySlot(
                        day_of_week=day,
                        start_time="09:00:00",
                        end_time="13:00:00",
                        capacity_hours=4.0,
                        is_available=True,
                    )
                )

        blackouts: List[BlackoutWindow] = []
        for b in raw_blocks:
            if b.is_blackout:
                blackouts.append(
                    BlackoutWindow(
                        start_time=b.start_time,
                        end_time=b.end_time,
                        is_blackout=True,
                        title=b.title,
                    )
                )

        return templates, blackouts

    async def get_summary(self, user_id: str) -> DashboardSummaryResponse:
        items, _ = await self.work_repo.list_work_items(
            user_id=user_id,
            limit=200,
            sort_by="dynamic_priority",
            order="desc",
        )

        now = datetime.now(timezone.utc)
        templates, blackouts = await self._get_availability_context(user_id)

        risk_counts: Dict[str, int] = {
            "safe": 0,
            "watch": 0,
            "at_risk": 0,
            "critical": 0,
            "overdue": 0,
        }
        critical_items: List[CriticalItemSummary] = []
        week_workload = 0.0

        for item in items:
            if item.status == "COMPLETED":
                continue

            # Calculate deterministic risk
            risk_res = DeadlineRiskEngine.calculate_risk(
                remaining_effort_hours=item.remaining_estimated_hours,
                deadline_utc=item.deadline_utc,
                current_time_utc=now,
                availability_templates=templates,
                blackouts=blackouts,
            )

            state = risk_res.risk_state
            risk_counts[state] = risk_counts.get(state, 0) + 1

            # Count in week workload if active
            week_workload += item.remaining_estimated_hours

            if state in ("critical", "overdue") or (risk_res.risk_ratio >= 1.0 and item.deadline_utc):
                critical_items.append(
                    CriticalItemSummary(
                        id=item.id,
                        title=item.title,
                        deadline_utc=item.deadline_utc.isoformat() if item.deadline_utc else None,
                        remaining_estimated_hours=round(item.remaining_estimated_hours, 1),
                        available_hours_before_deadline=round(risk_res.suitable_capacity_hours, 1),
                        risk_state=state,
                        risk_ratio=round(risk_res.risk_ratio, 2),
                    )
                )

        # Calculate week focus capacity (next 7 days)
        week_end = now + timedelta(days=7)
        dummy_risk = DeadlineRiskEngine.calculate_risk(
            remaining_effort_hours=0.0,
            deadline_utc=week_end,
            current_time_utc=now,
            availability_templates=templates,
            blackouts=blackouts,
        )
        # Compute exact available hours over next 7 days
        week_capacity = 0.0
        template_day_map = {t.day_of_week: t.capacity_hours for t in templates if t.is_available}
        for d in range(7):
            target_date = (now + timedelta(days=d)).date()
            dow = (target_date.weekday() + 1) % 7
            week_capacity += template_day_map.get(dow, 4.0)

        # Subtract active blackouts within week
        for b in blackouts:
            b_start = b.start_time if b.start_time.tzinfo else b.start_time.replace(tzinfo=timezone.utc)
            b_end = b.end_time if b.end_time.tzinfo else b.end_time.replace(tzinfo=timezone.utc)
            if b_start < week_end and b_end > now:
                overlap_dur = (min(b_end, week_end) - max(b_start, now)).total_seconds() / 3600.0
                week_capacity = max(0.0, week_capacity - overlap_dur)

        week_capacity = round(week_capacity, 1)
        week_workload = round(week_workload, 1)

        ratio = (week_workload / week_capacity) if week_capacity > 0 else (2.0 if week_workload > 0 else 0.0)
        if ratio > 1.0:
            capacity_status = "overloaded"
            assessment = "Overloaded — Required effort exceeds available weekly focus time"
        elif ratio > 0.85:
            capacity_status = "tight"
            assessment = "Tight — Weekly schedule has narrow safety margins"
        elif ratio > 0.50:
            capacity_status = "balanced"
            assessment = "Balanced — Realistic workload with comfortable buffer"
        else:
            capacity_status = "safe"
            assessment = "Safe — Ample available focus capacity"

        cap_metric = CapacityMetricSummary(
            available_focus_hours=week_capacity,
            committed_work_hours=week_workload,
            net_buffer_hours=round(max(0.0, week_capacity - week_workload), 1),
            risk_assessment=assessment,
            week_number=now.isocalendar()[1],
        )

        return DashboardSummaryResponse(
            risk_counts=risk_counts,
            critical_items=critical_items[:10],
            week_workload_hours=week_workload,
            week_capacity_hours=week_capacity,
            capacity_status=capacity_status,
            capacity_metric=cap_metric,
        )

    async def get_timeline_projection(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        days: int = 14,
    ) -> TimelineProjectionResponse:
        now = datetime.now(timezone.utc)
        start = start_date if start_date else now
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        days = min(max(days, 1), 60)
        end = start + timedelta(days=days)

        items, _ = await self.work_repo.list_work_items(
            user_id=user_id,
            limit=100,
            sort_by="dynamic_priority",
            order="desc",
        )
        templates, blackouts = await self._get_availability_context(user_id)
        template_day_map = {t.day_of_week: t.capacity_hours for t in templates if t.is_available}

        # Daily capacity tracker
        daily_available: Dict[str, float] = {}
        for d in range(days):
            day_dt = (start + timedelta(days=d)).date()
            dow = (day_dt.weekday() + 1) % 7
            daily_available[day_dt.isoformat()] = template_day_map.get(dow, 4.0)

        projected_items: List[TimelineItemProjection] = []

        for item in items:
            if item.status == "COMPLETED" or item.remaining_estimated_hours <= 0:
                continue

            remaining = item.remaining_estimated_hours
            allocated_slots: List[TimelineSlot] = []
            completion_dt: Optional[datetime] = None

            for d in range(days):
                if remaining <= 0:
                    break
                day_dt = (start + timedelta(days=d)).date()
                day_key = day_dt.isoformat()
                avail_on_day = daily_available.get(day_key, 0.0)
                if avail_on_day <= 0:
                    continue

                assign_hrs = min(remaining, avail_on_day)
                allocated_slots.append(TimelineSlot(date=day_key, hours=round(assign_hrs, 1)))
                remaining -= assign_hrs
                daily_available[day_key] -= assign_hrs

                if remaining <= 0:
                    completion_dt = datetime(day_dt.year, day_dt.month, day_dt.day, 18, 0, 0, tzinfo=timezone.utc)

            # Check if projected late
            is_late = False
            if item.deadline_utc:
                deadline = item.deadline_utc if item.deadline_utc.tzinfo else item.deadline_utc.replace(tzinfo=timezone.utc)
                if completion_dt is None or completion_dt > deadline:
                    is_late = True

            projected_items.append(
                TimelineItemProjection(
                    work_item_id=item.id,
                    title=item.title,
                    category=item.category,
                    risk_state=item.risk_state,
                    deadline_utc=item.deadline_utc.isoformat() if item.deadline_utc else None,
                    remaining_estimated_hours=round(item.remaining_estimated_hours, 1),
                    projected_completion_utc=completion_dt.isoformat() if completion_dt else None,
                    is_projected_late=is_late,
                    allocated_slots=allocated_slots,
                )
            )

        return TimelineProjectionResponse(
            timeline_window=TimelineWindow(
                start_date=start.isoformat(),
                end_date=end.isoformat(),
            ),
            items=projected_items,
        )

    async def get_workload_capacity(
        self,
        user_id: str,
        view: str = "day",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> WorkloadCapacityResponse:
        today = date.today()
        start = start_date or today
        end = end_date or (start + timedelta(days=7 if view == "day" else 28))

        templates, _ = await self._get_availability_context(user_id)
        template_day_map = {t.day_of_week: t.capacity_hours for t in templates if t.is_available}

        items, _ = await self.work_repo.list_work_items(user_id=user_id, limit=200)
        active_items = [i for i in items if i.status != "COMPLETED" and i.remaining_estimated_hours > 0]

        # Map due items to target date
        day_demand: Dict[date, float] = {}
        for item in active_items:
            if item.deadline_utc:
                due_day = item.deadline_utc.date()
                day_demand[due_day] = day_demand.get(due_day, 0.0) + item.remaining_estimated_hours

        periods: List[WorkloadPeriod] = []
        cur = start
        while cur <= end:
            dow = (cur.weekday() + 1) % 7
            cap = template_day_map.get(dow, 4.0)
            demand = round(day_demand.get(cur, 0.0), 1)
            util = round((demand / cap * 100) if cap > 0 else (100.0 if demand > 0 else 0.0), 1)

            periods.append(
                WorkloadPeriod(
                    date_label=cur.isoformat(),
                    day_of_week=cur.strftime("%A"),
                    capacity_hours=cap,
                    demand_hours=demand,
                    utilization_percentage=util,
                    is_overloaded=util > 100.0,
                )
            )
            cur += timedelta(days=1)

        return WorkloadCapacityResponse(periods=periods)
