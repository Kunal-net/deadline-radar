from __future__ import annotations

from datetime import date, datetime, timezone
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_analysis import AIAnalysis
from app.models.availability import TimeAvailability
from app.models.interest import UserInterest
from app.models.notification import Notification
from app.models.pace_factor import UserPaceFactor
from app.models.plan import Plan, PlanItem
from app.models.preference import UserPreference
from app.models.schedule_block import ScheduleBlock
from app.models.time_entry import ActiveSession, TimeEntry
from app.models.user import User
from app.models.work_estimate import WorkEstimate
from app.models.work_item import WorkItem
from app.models.work_unit import WorkUnit


@pytest.mark.asyncio
async def test_user_and_preference_creation(db_session: AsyncSession):
    user = User(
        email="alex@university.edu",
        hashed_password="hashed_secret_123",
        full_name="Alex Mercer",
    )
    db_session.add(user)
    await db_session.flush()

    pref = UserPreference(
        user_id=user.id,
        daily_focus_capacity_hours=5.0,
        buffer_percentage=25.0,
        theme="dark_editorial",
    )
    db_session.add(pref)
    await db_session.commit()

    result = await db_session.execute(select(User).where(User.email == "alex@university.edu"))
    fetched_user = result.scalar_one()
    assert fetched_user.full_name == "Alex Mercer"
    assert fetched_user.id is not None


@pytest.mark.asyncio
async def test_work_item_and_units_cascade(db_session: AsyncSession):
    user = User(
        email="test_work@university.edu",
        hashed_password="hashed_secret_123",
        full_name="Work Tester",
    )
    db_session.add(user)
    await db_session.flush()

    work_item = WorkItem(
        user_id=user.id,
        title="Operating Systems Lab 2",
        category="academic",
        deadline_utc=datetime(2026, 9, 25, 23, 59, 59, tzinfo=timezone.utc),
        total_estimated_hours=6.0,
        remaining_estimated_hours=6.0,
    )
    db_session.add(work_item)
    await db_session.flush()

    unit1 = WorkUnit(
        work_item_id=work_item.id,
        user_id=user.id,
        title="Thread Pool Implementation",
        sequence_order=1,
        estimated_hours=3.5,
    )
    unit2 = WorkUnit(
        work_item_id=work_item.id,
        user_id=user.id,
        title="Synchronization Tests",
        sequence_order=2,
        estimated_hours=2.5,
    )
    db_session.add_all([unit1, unit2])
    await db_session.commit()

    # Query work item with units
    result = await db_session.execute(
        select(WorkItem).where(WorkItem.id == work_item.id)
    )
    item = result.scalar_one()
    assert item.title == "Operating Systems Lab 2"

    units_result = await db_session.execute(
        select(WorkUnit).where(WorkUnit.work_item_id == work_item.id).order_by(WorkUnit.sequence_order)
    )
    units = units_result.scalars().all()
    assert len(units) == 2
    assert units[0].sequence_order == 1
    assert units[1].sequence_order == 2

    # Verify cascading delete
    await db_session.delete(item)
    await db_session.commit()

    orphans_result = await db_session.execute(
        select(WorkUnit).where(WorkUnit.work_item_id == work_item.id)
    )
    assert len(orphans_result.scalars().all()) == 0


@pytest.mark.asyncio
async def test_time_entry_and_active_session(db_session: AsyncSession):
    user = User(
        email="tracking@university.edu",
        hashed_password="hashed_secret_123",
        full_name="Tracking Tester",
    )
    db_session.add(user)
    await db_session.flush()

    session = ActiveSession(
        user_id=user.id,
        notes="Testing timer session",
    )
    db_session.add(session)
    await db_session.flush()

    entry = TimeEntry(
        user_id=user.id,
        start_time=datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc),
        end_time=datetime(2026, 9, 20, 11, 30, 0, tzinfo=timezone.utc),
        duration_seconds=5400,
        duration_hours=1.5,
        source="stopwatch",
    )
    db_session.add(entry)
    await db_session.commit()

    result = await db_session.execute(
        select(TimeEntry).where(TimeEntry.user_id == user.id)
    )
    assert result.scalar_one().duration_hours == 1.5


@pytest.mark.asyncio
async def test_plan_and_plan_items(db_session: AsyncSession):
    user = User(
        email="planning@university.edu",
        hashed_password="hashed_secret_123",
        full_name="Plan Tester",
    )
    db_session.add(user)
    await db_session.flush()

    today = date(2026, 9, 20)
    plan = Plan(user_id=user.id, plan_date=today, total_planned_minutes=180)
    db_session.add(plan)
    await db_session.flush()

    item = PlanItem(
        plan_id=plan.id,
        title="Deep Focus — Core Architecture",
        duration_minutes=90,
        sequence_order=1,
    )
    db_session.add(item)
    await db_session.commit()

    res = await db_session.execute(select(PlanItem).where(PlanItem.plan_id == plan.id))
    assert res.scalar_one().title == "Deep Focus — Core Architecture"


@pytest.mark.asyncio
async def test_notification_and_ai_analysis(db_session: AsyncSession):
    user = User(
        email="ai_notif@university.edu",
        hashed_password="hashed_secret_123",
        full_name="AI Notif Tester",
    )
    db_session.add(user)
    await db_session.flush()

    notif = Notification(
        user_id=user.id,
        title="Risk Escalation",
        message="Assignment is now at risk",
        urgency_level="urgent",
    )
    analysis = AIAnalysis(
        user_id=user.id,
        operation_type="decomposition",
        prompt_text="Build compiler",
        response_json='{"units": []}',
    )
    db_session.add_all([notif, analysis])
    await db_session.commit()

    n_res = await db_session.execute(select(Notification).where(Notification.user_id == user.id))
    assert n_res.scalar_one().urgency_level == "urgent"

    a_res = await db_session.execute(select(AIAnalysis).where(AIAnalysis.user_id == user.id))
    assert a_res.scalar_one().operation_type == "decomposition"
