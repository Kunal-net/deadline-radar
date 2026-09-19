from __future__ import annotations

import logging
from datetime import datetime, time, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.priority_engine import PriorityEngine, WorkItemPriorityInput
from app.domain.risk_engine import (
    AvailabilitySlot,
    BlackoutWindow,
    DeadlineRiskEngine,
)
from app.models import (
    ActiveSession,
    Notification,
    ScheduleBlock,
    TimeAvailability,
    TimeEntry,
    User,
    UserPaceFactor,
    UserPreference,
    WorkItem,
)
from app.repositories.availability_repo import AvailabilityRepository
from app.repositories.notification_repo import NotificationRepository
from app.repositories.tracking_repo import TrackingRepository
from app.repositories.work_repo import WorkItemRepository
from app.schemas.notification import RecalculationResponse

logger = logging.getLogger("deadline_radar.recalculation")


class BackgroundRecalculationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.work_repo = WorkItemRepository(db)
        self.avail_repo = AvailabilityRepository(db)
        self.track_repo = TrackingRepository(db)
        self.notif_repo = NotificationRepository(db)

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

    async def recalculate_user_workload(self, user_id: str) -> RecalculationResponse:
        now = datetime.now(timezone.utc)
        logger.info(f"Starting deterministic recalculation for user '{user_id}' at {now.isoformat()}")

        # 1. Fetch Availability Templates
        raw_templates = await self.avail_repo.list_templates(user_id)
        templates: List[AvailabilitySlot] = []
        for t in raw_templates:
            if t.is_available:
                templates.append(
                    AvailabilitySlot(
                        day_of_week=t.day_of_week,
                        start_time=str(t.start_time),
                        end_time=str(t.end_time),
                        capacity_hours=t.capacity_hours,
                        is_available=t.is_available,
                    )
                )

        # 2. Fetch Upcoming Schedule Blocks (Next 45 days)
        horizon_end = now + timedelta(days=45)
        raw_blocks = await self.avail_repo.list_blocks(
            user_id, start_time=now, end_time=horizon_end
        )
        blocks: List[BlackoutWindow] = []
        for b in raw_blocks:
            blocks.append(
                BlackoutWindow(
                    start_time=b.start_time_utc,
                    end_time=b.end_time_utc,
                    title=b.title,
                )
            )

        # 3. Fetch User Preference Buffer Percentage
        pref_stmt = select(UserPreference).where(UserPreference.user_id == user_id)
        pref_res = await self.db.execute(pref_stmt)
        pref = pref_res.scalar_one_or_none()
        buffer_pct = pref.buffer_percentage if pref else 0.20
        buffer_pct_val = (buffer_pct * 100.0) if buffer_pct <= 1.0 else buffer_pct

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

        # 5. Fetch Active Work Items
        items, _ = await self.work_repo.list_work_items(
            user_id=user_id,
            status=None,
            limit=200,
            offset=0,
        )

        risk_transitions: List[Dict[str, Any]] = []
        notifications_created = 0

        for item in items:
            if item.status in {"completed", "cancelled"}:
                continue

            old_risk_state = item.risk_state

            # Deterministic Deadline Risk Engine
            risk_eval = DeadlineRiskEngine.calculate_risk(
                remaining_effort_hours=item.remaining_estimated_hours,
                deadline_utc=item.deadline_utc,
                current_time_utc=now,
                availability_templates=templates,
                blackouts=blocks,
                buffer_percentage=buffer_pct_val,
                pace_factor=pace_factor,
                is_completed=(item.status == "completed"),
            )

            item.risk_state = risk_eval.risk_state
            item.risk_ratio = risk_eval.risk_ratio

            # Deterministic Dynamic Priority Engine
            priority_input = WorkItemPriorityInput(
                item_id=item.id,
                title=item.title,
                status=item.status,
                deadline_utc=item.deadline_utc,
                remaining_hours=item.remaining_estimated_hours,
                importance_weight=item.importance_weight,
                risk_state=item.risk_state,
                risk_ratio=item.risk_ratio,
                is_hard_deadline=item.is_hard_deadline,
                completion_pct=item.completion_pct,
            )
            priority_eval = PriorityEngine.evaluate(priority_input, current_time=now)
            item.dynamic_priority = priority_eval.priority_score
            item.priority_explanation = priority_eval.priority_explanation

            # Check for Escalating Risk Transition
            if old_risk_state != item.risk_state:
                transition_data = {
                    "work_item_id": item.id,
                    "title": item.title,
                    "from_risk": old_risk_state,
                    "to_risk": item.risk_state,
                    "risk_ratio": item.risk_ratio,
                }
                risk_transitions.append(transition_data)

            # Generate proactive notification for elevated risk states (with 6h deduplication)
            if item.risk_state in {"at_risk", "critical", "overdue"}:
                recent_stmt = (
                    select(Notification)
                    .where(
                        Notification.user_id == user_id,
                        Notification.work_item_id == item.id,
                        Notification.created_at >= (now - timedelta(hours=6)),
                    )
                )
                recent_res = await self.db.execute(recent_stmt)
                if not recent_res.scalars().first():
                    urgency = "high" if item.risk_state in {"critical", "overdue"} else "normal"
                    notif = Notification(
                        user_id=user_id,
                        work_item_id=item.id,
                        title=f"Risk Alert: {item.title}",
                        message=f"Work item '{item.title}' is {item.risk_state.upper()} ({item.risk_ratio:.2f}x capacity required).",
                        notification_type="risk_escalation",
                        urgency_level=urgency,
                        is_read=False,
                    )
                    self.db.add(notif)
                    notifications_created += 1

        # 6. Detect and Close Stale Tracking Sessions (> 12 hours)
        stale_closed = 0
        active_sess = await self.track_repo.get_active_session(user_id)
        if active_sess:
            start_dt = active_sess.started_at
            if start_dt.tzinfo is None:
                start_dt = start_dt.replace(tzinfo=timezone.utc)
            duration_sec = (now - start_dt).total_seconds()
            if duration_sec > 12 * 3600:
                # Close stale session, cap logged time at 4 hours
                capped_minutes = 240
                entry = TimeEntry(
                    user_id=user_id,
                    work_item_id=active_sess.work_item_id,
                    work_unit_id=active_sess.work_unit_id,
                    started_at=start_dt,
                    ended_at=start_dt + timedelta(minutes=capped_minutes),
                    duration_minutes=capped_minutes,
                    notes="Auto-closed stale timer session capped at 4 hours.",
                )
                self.db.add(entry)
                await self.track_repo.delete_active_session(active_sess)
                stale_closed += 1
                logger.warning(f"Auto-closed stale active session for user '{user_id}' after {duration_sec / 3600:.1f}h")

        await self.db.flush()

        logger.info(
            f"Completed recalculation for user '{user_id}': "
            f"{len(items)} items, {len(risk_transitions)} transitions, {notifications_created} notifications"
        )

        return RecalculationResponse(
            user_id=user_id,
            items_recalculated=len(items),
            risk_transitions=risk_transitions,
            stale_sessions_closed=stale_closed,
            notifications_created=notifications_created,
        )

    async def recalculate_all_users(self) -> Dict[str, Any]:
        """Batch recalculation runner for all registered users."""
        stmt = select(User.id)
        res = await self.db.execute(stmt)
        user_ids = list(res.scalars().all())

        total_items = 0
        total_transitions = 0
        total_notifs = 0

        for uid in user_ids:
            try:
                sub_res = await self.recalculate_user_workload(uid)
                total_items += sub_res.items_recalculated
                total_transitions += len(sub_res.risk_transitions)
                total_notifs += sub_res.notifications_created
            except Exception as e:
                logger.error(f"Failed recalculation for user '{uid}': {e}", exc_info=True)

        return {
            "users_processed": len(user_ids),
            "total_items_recalculated": total_items,
            "total_risk_transitions": total_transitions,
            "total_notifications_created": total_notifs,
        }
