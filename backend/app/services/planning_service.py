from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundException
from app.domain.planner import CandidateWork, DailyPlanner
from app.domain.priority_engine import PriorityEngine, WorkItemPriorityInput
from app.models import (
    ActiveSession,
    Plan,
    PlanItem,
    UserInterest,
    UserPaceFactor,
    UserPreference,
    WorkItem,
    WorkUnit,
)
from app.repositories.availability_repo import AvailabilityRepository
from app.repositories.planning_repo import PlanningRepository
from app.repositories.tracking_repo import TrackingRepository
from app.repositories.work_repo import WorkItemRepository
from app.schemas.plan import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    PlanItemResponse,
    PlanItemUpdateRequest,
    PlanResponse,
    RecommendationItem,
    TodayOverviewResponse,
)


class PlanningService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.planning_repo = PlanningRepository(db)
        self.work_repo = WorkItemRepository(db)
        self.avail_repo = AvailabilityRepository(db)
        self.track_repo = TrackingRepository(db)

    def _format_plan_item(self, item: PlanItem) -> PlanItemResponse:
        return PlanItemResponse(
            id=item.id,
            work_item_id=item.work_item_id,
            work_unit_id=item.work_unit_id,
            title=item.title,
            planned_start=item.planned_start.isoformat() if item.planned_start else None,
            planned_end=item.planned_end.isoformat() if item.planned_end else None,
            duration_minutes=item.duration_minutes,
            sequence_order=item.sequence_order,
            status=item.status,
            is_protected=item.is_protected,
            notes=item.notes,
        )

    def _format_plan(self, plan: Plan) -> PlanResponse:
        return PlanResponse(
            id=plan.id,
            plan_date=plan.plan_date.isoformat(),
            total_planned_minutes=plan.total_planned_minutes,
            total_completed_minutes=plan.total_completed_minutes,
            is_finalized=plan.is_finalized,
            items=[self._format_plan_item(item) for item in (plan.items or [])],
        )

    async def generate_daily_plan(
        self,
        user_id: str,
        request: PlanGenerateRequest,
    ) -> PlanGenerateResponse:
        # Determine target date
        if request.target_date:
            target_date = date.fromisoformat(request.target_date)
        else:
            target_date = datetime.now(timezone.utc).date()

        day_of_week = target_date.weekday()

        # 1. Fetch Availability Templates for weekday
        all_templates = await self.avail_repo.list_templates(user_id)
        templates = [t for t in all_templates if t.day_of_week == day_of_week and t.is_available]
        available_slots: List[tuple[time, time]] = []
        for t in templates:
            available_slots.append((t.start_time, t.end_time))

        if not available_slots:
            # Default working window
            available_slots = [(time(9, 0), time(17, 0))]

        # 2. Fetch Blackout Blocks for target_date
        target_start_utc = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
        target_end_utc = datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)
        blocks = await self.avail_repo.list_blocks(
            user_id, start_time=target_start_utc, end_time=target_end_utc
        )
        blackout_tuples: List[tuple[time, time, str]] = []
        for b in blocks:
            blackout_tuples.append((b.start_time_utc.time(), b.end_time_utc.time(), b.title))

        # 3. Fetch Personal Interests if requested
        interests_list: List[tuple[str, int]] = []
        if request.include_interests:
            stmt = select(UserInterest).where(
                UserInterest.user_id == user_id, UserInterest.is_protected == True
            )
            res = await self.db.execute(stmt)
            for interest in res.scalars().all():
                daily_min = max(30, int((interest.target_weekly_hours / 7.0) * 60.0))
                interests_list.append((interest.name, daily_min))

        # 4. Fetch User Pace Factor
        pace_stmt = (
            select(UserPaceFactor)
            .where(UserPaceFactor.user_id == user_id)
            .order_by(UserPaceFactor.updated_at.desc())
            .limit(1)
        )
        pace_res = await self.db.execute(pace_stmt)
        latest_pace = pace_res.scalar_one_or_none()
        pace_factor = latest_pace.pace_factor if latest_pace else 1.0

        # 5. Fetch Active Work Items and Units
        work_items_res = await self.work_repo.list_work_items(
            user_id=user_id,
            status=None,  # We'll filter out completed/cancelled below
            sort_by="dynamic_priority",
            order="desc",
            limit=50,
            offset=0,
        )
        work_items, _ = work_items_res

        # Build candidate work list
        candidate_work: List[CandidateWork] = []
        for item in work_items:
            if item.status in {"completed", "cancelled"}:
                continue

            # Check if item has uncompleted units
            units = item.units or []
            pending_units = [u for u in units if not u.is_completed]

            if pending_units:
                for u in pending_units:
                    candidate_work.append(
                        CandidateWork(
                            item_id=item.id,
                            title=item.title,
                            priority_score=item.dynamic_priority,
                            remaining_hours=u.estimated_hours - u.actual_hours if (u.estimated_hours > u.actual_hours) else 0.5,
                            deadline_utc=item.deadline_utc,
                            unit_id=u.id,
                            unit_title=u.title,
                            is_blocked=(item.status == "blocked"),
                        )
                    )
            else:
                candidate_work.append(
                    CandidateWork(
                        item_id=item.id,
                        title=item.title,
                        priority_score=item.dynamic_priority,
                        remaining_hours=item.remaining_estimated_hours,
                        deadline_utc=item.deadline_utc,
                        is_blocked=(item.status == "blocked"),
                    )
                )

        # 6. Run Deterministic Daily Planner Engine
        planner_result = DailyPlanner.generate_plan(
            target_date=target_date,
            available_slots=available_slots,
            blackout_blocks=blackout_tuples,
            candidate_work=candidate_work,
            personal_interests=interests_list,
            max_hours=request.max_hours,
            include_interests=request.include_interests,
            pace_factor=pace_factor,
        )
        # 7. Check if plan already exists for date; if so, replace items
        existing_plan = await self.planning_repo.get_plan_by_date(user_id, target_date)
        if existing_plan:
            # Delete old items
            stmt_del = delete(PlanItem).where(PlanItem.plan_id == existing_plan.id)
            await self.db.execute(stmt_del)
            plan = existing_plan
        else:
            plan = Plan(
                user_id=user_id,
                plan_date=target_date,
                total_planned_minutes=0,
                total_completed_minutes=0,
                is_finalized=False,
            )
            self.db.add(plan)
            await self.db.flush()

        # Add new plan items
        for block in planner_result.planned_blocks:
            pi = PlanItem(
                plan_id=plan.id,
                work_item_id=block.work_item_id,
                work_unit_id=block.work_unit_id,
                title=block.title,
                planned_start=block.start_dt,
                planned_end=block.end_dt,
                duration_minutes=block.duration_minutes,
                sequence_order=block.sequence_order,
                status="pending",
                is_protected=block.is_protected,
                notes=block.reason,
            )
            self.db.add(pi)

        plan.total_planned_minutes = planner_result.total_planned_minutes
        await self.db.flush()

        # Expire session cache for plan so refreshed query gets latest items
        self.db.expire(plan)

        # Refresh plan with eager relations
        refreshed_plan = await self.planning_repo.get_plan_by_date(user_id, target_date)
        return PlanGenerateResponse(plan=self._format_plan(refreshed_plan or plan))

    async def get_plan_by_date(self, user_id: str, plan_date: date) -> Optional[PlanResponse]:
        plan = await self.planning_repo.get_plan_by_date(user_id, plan_date)
        if not plan:
            return None
        return self._format_plan(plan)

    async def update_plan_item(
        self,
        user_id: str,
        item_id: str,
        request: PlanItemUpdateRequest,
    ) -> PlanItemResponse:
        item = await self.planning_repo.get_plan_item(item_id, user_id)
        if not item:
            raise NotFoundException(f"Plan item '{item_id}' not found.")

        if request.status is not None:
            item.status = request.status
        if request.notes is not None:
            item.notes = request.notes
        if request.sequence_order is not None:
            item.sequence_order = request.sequence_order

        await self.db.flush()
        return self._format_plan_item(item)

    async def get_today_overview(self, user_id: str) -> TodayOverviewResponse:
        today = datetime.now(timezone.utc).date()

        # 1. Fetch Today's Plan
        plan = await self.planning_repo.get_plan_by_date(user_id, today)
        today_plan_items = [self._format_plan_item(it) for it in plan.items] if plan else []

        # 2. Fetch Active Tracking Session
        active_sess = await self.track_repo.get_active_session(user_id)
        active_session_data = None
        if active_sess:
            now = datetime.now(timezone.utc)
            start = active_sess.started_at
            if start.tzinfo is None:
                start = start.replace(tzinfo=timezone.utc)
            elapsed = max(0, int((now - start).total_seconds()))

            item_title = active_sess.work_item.title if active_sess.work_item else "Direct Focus"
            unit_title = active_sess.work_unit.title if active_sess.work_unit else None

            active_session_data = {
                "session_id": active_sess.id,
                "work_item_id": active_sess.work_item_id,
                "work_item_title": item_title,
                "work_unit_title": unit_title,
                "started_at": start.isoformat(),
                "elapsed_seconds": elapsed,
            }

        # 3. Derive Recommendations from Plan Items
        now_rec = None
        next_rec = None
        pending_items = [it for it in (plan.items if plan else []) if it.status in {"pending", "in_progress"}]
        if pending_items:
            first = pending_items[0]
            now_rec = RecommendationItem(
                work_item_id=first.work_item_id,
                title=first.title,
                duration_minutes=first.duration_minutes,
                reason=first.notes or "Highest priority item scheduled for today.",
                planned_start=first.planned_start.isoformat() if first.planned_start else None,
            )
            if len(pending_items) > 1:
                second = pending_items[1]
                next_rec = RecommendationItem(
                    work_item_id=second.work_item_id,
                    title=second.title,
                    duration_minutes=second.duration_minutes,
                    planned_start=second.planned_start.isoformat() if second.planned_start else None,
                )

        # 4. Compute Today's Capacity & Workload Pressure
        all_templates = await self.avail_repo.list_templates(user_id)
        templates = [t for t in all_templates if t.day_of_week == today.weekday() and t.is_available]
        avail_hours = sum(t.capacity_hours for t in templates) if templates else 8.0
        day_capacity_hours = round(avail_hours, 1)

        total_planned = plan.total_planned_minutes if plan else 0
        day_allocated_hours = round(total_planned / 60.0, 1)

        # 5. Urgent deadlines count (items due within 48 hours in at_risk, critical, or overdue state)
        threshold_dt = datetime.now(timezone.utc) + timedelta(hours=48)
        urgent_items, urgent_cnt = await self.work_repo.list_work_items(
            user_id=user_id,
            due_before=threshold_dt,
            risk_state=None,
            limit=100,
            offset=0,
        )
        urgent_count = len([
            i for i in urgent_items
            if i.status not in {"completed", "cancelled"}
            and i.risk_state in {"at_risk", "critical", "overdue"}
        ])

        return TodayOverviewResponse(
            date=today.isoformat(),
            active_session=active_session_data,
            now_recommendation=now_rec,
            next_recommendation=next_rec,
            urgent_deadlines_count=urgent_count,
            day_capacity_hours=day_capacity_hours,
            day_allocated_hours=day_allocated_hours,
            today_plan_items=today_plan_items,
        )
