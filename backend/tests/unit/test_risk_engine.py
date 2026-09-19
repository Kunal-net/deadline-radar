from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from app.domain.risk_engine import (
    AvailabilitySlot,
    BlackoutWindow,
    DeadlineRiskEngine,
)


@pytest.fixture
def sample_templates():
    # 7 days with 4 hours each (18:00 - 22:00)
    return [
        AvailabilitySlot(day_of_week=i, start_time="18:00:00", end_time="22:00:00", capacity_hours=4.0)
        for i in range(7)
    ]


def test_completed_work():
    now = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    deadline = datetime(2026, 9, 25, 23, 59, 59, tzinfo=timezone.utc)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=0.0,
        deadline_utc=deadline,
        current_time_utc=now,
        availability_templates=[],
        blackouts=[],
        is_completed=True,
    )
    assert res.risk_state == "safe"
    assert res.risk_ratio == 0.0
    assert res.remaining_effort_hours == 0.0


def test_no_deadline():
    now = datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=10.0,
        deadline_utc=None,
        current_time_utc=now,
        availability_templates=[],
        blackouts=[],
    )
    assert res.risk_state == "safe"
    assert res.risk_ratio == 0.0


def test_passed_deadline_overdue():
    now = datetime(2026, 9, 21, 10, 0, 0, tzinfo=timezone.utc)
    past_deadline = datetime(2026, 9, 20, 18, 0, 0, tzinfo=timezone.utc)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=4.0,
        deadline_utc=past_deadline,
        current_time_utc=now,
        availability_templates=[],
        blackouts=[],
    )
    assert res.risk_state == "overdue"
    assert res.risk_ratio == 9.99
    assert res.deadline_distance_hours < 0


def test_comfortable_capacity_safe(sample_templates):
    # 5 days ahead, ~20h gross, ~16h net with 20% buffer. Required effort = 4h -> R = 4/16 = 0.25 (safe)
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)
    deadline = now + timedelta(days=5)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=4.0,
        deadline_utc=deadline,
        current_time_utc=now,
        availability_templates=sample_templates,
        blackouts=[],
        buffer_percentage=20.0,
    )
    assert res.risk_state == "safe"
    assert res.risk_ratio < 0.7
    assert res.deficit_surplus_hours > 0


def test_tight_buffer_watch(sample_templates):
    # 2 days ahead, ~8h gross, ~6.4h net with 20% buffer. Required effort = 5.5h -> R = 5.5/6.4 = ~0.86 (watch)
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)
    deadline = now + timedelta(days=2)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=5.5,
        deadline_utc=deadline,
        current_time_utc=now,
        availability_templates=sample_templates,
        blackouts=[],
        buffer_percentage=20.0,
    )
    assert res.risk_state == "watch"
    assert 0.7 <= res.risk_ratio < 1.0


def test_capacity_deficit_at_risk(sample_templates):
    # 2 days ahead, ~6.4h net suitable. Required effort = 7.5h -> R = 7.5/6.4 = ~1.17 (at_risk)
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)
    deadline = now + timedelta(days=2)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=7.5,
        deadline_utc=deadline,
        current_time_utc=now,
        availability_templates=sample_templates,
        blackouts=[],
        buffer_percentage=20.0,
    )
    assert res.risk_state == "at_risk"
    assert 1.0 <= res.risk_ratio < 1.5
    assert res.deficit_surplus_hours < 0


def test_severe_deficit_critical(sample_templates):
    # 1 day ahead, ~3.2h net suitable. Required effort = 6.0h -> R = 6.0/3.2 = 1.88 (critical)
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)
    deadline = now + timedelta(days=1)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=6.0,
        deadline_utc=deadline,
        current_time_utc=now,
        availability_templates=sample_templates,
        blackouts=[],
        buffer_percentage=20.0,
    )
    assert res.risk_state == "critical"
    assert res.risk_ratio >= 1.5


def test_blackout_window_deduction(sample_templates):
    # 1 day ahead (18:00 - 22:00 = 4h). Blackout from 19:00 - 21:00 = 2h.
    # Gross capacity reduces from 4h to 2h!
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)
    deadline = now + timedelta(days=1)
    blackout = BlackoutWindow(
        start_time=datetime(2026, 9, 20, 19, 0, 0, tzinfo=timezone.utc),
        end_time=datetime(2026, 9, 20, 21, 0, 0, tzinfo=timezone.utc),
        is_blackout=True,
        title="Doctor Appointment",
    )
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=2.0,
        deadline_utc=deadline,
        current_time_utc=now,
        availability_templates=sample_templates,
        blackouts=[blackout],
        buffer_percentage=20.0,
    )
    # Net capacity without blackout was 4 * 0.8 = 3.2. With 2h blackout: 2 * 0.8 = 1.6h.
    # Effort = 2.0h / 1.6h = 1.25 (at_risk)
    assert res.risk_state == "at_risk"
    assert any("Doctor Appointment" in f or "deductions" in f.lower() for f in res.contributing_factors)


def test_personal_pace_factor_adjustment(sample_templates):
    # Nominal effort = 4.0h. User historically works at 1.5x pace (pace factor = 1.5) -> adjusted effort = 6.0h!
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)
    deadline = now + timedelta(days=2)
    res = DeadlineRiskEngine.calculate_risk(
        remaining_effort_hours=4.0,
        deadline_utc=deadline,
        current_time_utc=now,
        availability_templates=sample_templates,
        blackouts=[],
        pace_factor=1.5,
    )
    # Suitable capacity ~6.4h. Adjusted effort = 6.0h -> R = 6.0 / 6.4 = ~0.94 (watch)
    assert res.risk_state == "watch"
    assert any("pace factor" in f for f in res.contributing_factors)
