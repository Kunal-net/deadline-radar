from datetime import date, datetime, time, timedelta, timezone
import pytest

from app.domain.planner import CandidateWork, DailyPlanner


def test_basic_daily_plan_generation():
    target_date = date(2026, 9, 20)
    # Available: 09:00 to 13:00 (4 hours = 240 mins)
    available_slots = [(time(9, 0), time(13, 0))]
    blackouts = []

    candidates = [
        CandidateWork(
            item_id="work-1",
            title="High Priority Physics Lab",
            priority_score=92.0,
            remaining_hours=2.0,
            deadline_utc=datetime(2026, 9, 21, 17, 0, tzinfo=timezone.utc),
        ),
        CandidateWork(
            item_id="work-2",
            title="Medium Priority Essay",
            priority_score=65.0,
            remaining_hours=3.0,
            deadline_utc=datetime(2026, 9, 23, 17, 0, tzinfo=timezone.utc),
        ),
    ]

    result = DailyPlanner.generate_plan(
        target_date=target_date,
        available_slots=available_slots,
        blackout_blocks=blackouts,
        candidate_work=candidates,
        include_interests=False,
    )

    assert result.feasibility_valid is True
    assert result.total_planned_minutes > 0
    assert result.available_capacity_minutes == 240
    assert len(result.planned_blocks) >= 2
    # Highest priority task should be scheduled first
    assert result.planned_blocks[0].work_item_id == "work-1"
    assert result.planned_blocks[0].start_dt == datetime(2026, 9, 20, 9, 0, tzinfo=timezone.utc)


def test_blackout_commitments_carved_out():
    target_date = date(2026, 9, 20)
    # 09:00 - 17:00 with meeting from 11:00 to 13:00
    available_slots = [(time(9, 0), time(17, 0))]
    blackouts = [(time(11, 0), time(13, 0), "Faculty Meeting")]

    candidates = [
        CandidateWork(
            item_id="work-1",
            title="Task A",
            priority_score=85.0,
            remaining_hours=4.0,
        ),
    ]

    result = DailyPlanner.generate_plan(
        target_date=target_date,
        available_slots=available_slots,
        blackout_blocks=blackouts,
        candidate_work=candidates,
        include_interests=False,
    )

    assert result.feasibility_valid is True
    # Verify no block overlaps 11:00 to 13:00
    for block in result.planned_blocks:
        meeting_start = datetime(2026, 9, 20, 11, 0, tzinfo=timezone.utc)
        meeting_end = datetime(2026, 9, 20, 13, 0, tzinfo=timezone.utc)
        assert block.end_dt <= meeting_start or block.start_dt >= meeting_end


def test_protected_personal_interests():
    target_date = date(2026, 9, 20)
    available_slots = [(time(9, 0), time(12, 0))]  # 3h = 180m
    blackouts = []
    interests = [("Gym Strength Training", 60)]

    candidates = [
        CandidateWork(
            item_id="work-1",
            title="Thesis Writing",
            priority_score=80.0,
            remaining_hours=5.0,
        ),
    ]

    result = DailyPlanner.generate_plan(
        target_date=target_date,
        available_slots=available_slots,
        blackout_blocks=blackouts,
        candidate_work=candidates,
        personal_interests=interests,
        include_interests=True,
    )

    assert result.feasibility_valid is True
    # Verify gym is scheduled and marked protected
    gym_blocks = [b for b in result.planned_blocks if b.is_protected]
    assert len(gym_blocks) == 1
    assert "Gym" in gym_blocks[0].title
    assert gym_blocks[0].duration_minutes == 60


def test_user_daily_cap_hours():
    target_date = date(2026, 9, 20)
    available_slots = [(time(8, 0), time(20, 0))]  # 12h = 720m available
    blackouts = []

    candidates = [
        CandidateWork(
            item_id=f"work-{i}",
            title=f"Task {i}",
            priority_score=90.0 - i,
            remaining_hours=2.0,
        )
        for i in range(10)
    ]

    # User requests max 3.0 hours (180 minutes)
    result = DailyPlanner.generate_plan(
        target_date=target_date,
        available_slots=available_slots,
        blackout_blocks=blackouts,
        candidate_work=candidates,
        max_hours=3.0,
        include_interests=False,
    )

    assert result.feasibility_valid is True
    assert result.total_planned_minutes <= 180
