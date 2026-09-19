from __future__ import annotations

from datetime import date, datetime, timezone
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.availability import TimeAvailability
from app.models.interest import UserInterest
from app.models.notification import Notification
from app.models.plan import Plan, PlanItem
from app.models.preference import UserPreference
from app.models.schedule_block import ScheduleBlock
from app.models.time_entry import ActiveSession, TimeEntry
from app.models.user import User
from app.models.work_item import WorkItem
from app.models.work_unit import WorkUnit
from app.repositories.availability_repo import AvailabilityRepository
from app.repositories.notification_repo import NotificationRepository
from app.repositories.planning_repo import PlanningRepository
from app.repositories.tracking_repo import TrackingRepository
from app.repositories.user_repo import UserRepository
from app.repositories.work_repo import WorkItemRepository


@pytest.mark.asyncio
async def test_user_repository_flow(db_session: AsyncSession):
    repo = UserRepository(db_session)
    user = User(
        email="repo_test@university.edu",
        hashed_password="secret_password_123",
        full_name="Repo User",
    )
    await repo.create(user)
    await repo.commit()

    fetched = await repo.get_by_email("repo_test@university.edu")
    assert fetched is not None
    assert fetched.email == "repo_test@university.edu"

    # Test interest
    interest = UserInterest(
        user_id=user.id,
        name="Reading",
        category="creative",
        target_weekly_hours=3.0,
    )
    db_session.add(interest)
    await repo.commit()

    interests = await repo.list_interests(user.id)
    assert len(interests) == 1
    assert interests[0].name == "Reading"


@pytest.mark.asyncio
async def test_work_repository_flow(db_session: AsyncSession):
    user_repo = UserRepository(db_session)
    work_repo = WorkItemRepository(db_session)

    user = User(
        email="work_repo@university.edu",
        hashed_password="pwd",
        full_name="Work Repo Tester",
    )
    await user_repo.create(user)
    await user_repo.commit()

    item = WorkItem(
        user_id=user.id,
        title="Distributed Systems Project",
        category="project",
        status="todo",
        dynamic_priority=75.0,
    )
    await work_repo.create(item)
    await work_repo.commit()

    # Add units
    u1 = WorkUnit(
        work_item_id=item.id,
        user_id=user.id,
        title="Raft Leader Election",
        sequence_order=1,
    )
    u2 = WorkUnit(
        work_item_id=item.id,
        user_id=user.id,
        title="Log Replication",
        sequence_order=2,
    )
    await work_repo.create_unit(u1)
    await work_repo.create_unit(u2)
    await work_repo.commit()

    # Reorder
    reordered = await work_repo.reorder_units(
        item.id,
        user.id,
        [{"unit_id": u1.id, "sequence_order": 2}, {"unit_id": u2.id, "sequence_order": 1}],
    )
    assert reordered[0].title == "Log Replication"
    assert reordered[1].title == "Raft Leader Election"

    # List
    items, total = await work_repo.list_work_items(user.id, category="project")
    assert total == 1
    assert items[0].title == "Distributed Systems Project"


@pytest.mark.asyncio
async def test_availability_repository_flow(db_session: AsyncSession):
    user_repo = UserRepository(db_session)
    avail_repo = AvailabilityRepository(db_session)

    user = User(email="avail@university.edu", hashed_password="pwd", full_name="Avail Tester")
    await user_repo.create(user)
    await user_repo.commit()

    templates = [
        TimeAvailability(day_of_week=1, start_time="18:00:00", end_time="22:00:00", capacity_hours=4.0),
        TimeAvailability(day_of_week=2, start_time="19:00:00", end_time="22:00:00", capacity_hours=3.0),
    ]
    saved = await avail_repo.replace_templates(user.id, templates)
    await avail_repo.commit()
    assert len(saved) == 2

    # Schedule block
    block = ScheduleBlock(
        user_id=user.id,
        title="Doctor Appointment",
        start_time=datetime(2026, 9, 21, 14, 0, 0, tzinfo=timezone.utc),
        end_time=datetime(2026, 9, 21, 15, 0, 0, tzinfo=timezone.utc),
    )
    await avail_repo.create_block(block)
    await avail_repo.commit()

    blocks = await avail_repo.list_blocks(
        user.id,
        start_time=datetime(2026, 9, 21, 0, 0, 0, tzinfo=timezone.utc),
        end_time=datetime(2026, 9, 21, 23, 59, 59, tzinfo=timezone.utc),
    )
    assert len(blocks) == 1
    assert blocks[0].title == "Doctor Appointment"


@pytest.mark.asyncio
async def test_notification_repository_flow(db_session: AsyncSession):
    user_repo = UserRepository(db_session)
    notif_repo = NotificationRepository(db_session)

    user = User(email="notif@university.edu", hashed_password="pwd", full_name="Notif Tester")
    await user_repo.create(user)
    await user_repo.commit()

    n1 = Notification(user_id=user.id, title="Alert 1", message="Msg 1")
    n2 = Notification(user_id=user.id, title="Alert 2", message="Msg 2")
    db_session.add_all([n1, n2])
    await notif_repo.commit()

    unread_count = await notif_repo.count_unread(user.id)
    assert unread_count == 2

    await notif_repo.mark_as_read(n1.id, user.id)
    await notif_repo.commit()
    assert await notif_repo.count_unread(user.id) == 1

    marked = await notif_repo.mark_all_as_read(user.id)
    await notif_repo.commit()
    assert marked == 1
    assert await notif_repo.count_unread(user.id) == 0
