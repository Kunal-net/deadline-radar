from datetime import datetime, timedelta, timezone
import pytest

from app.domain.priority_engine import (
    PriorityEngine,
    PriorityLevel,
    WorkItemPriorityInput,
)


def test_completed_or_cancelled_has_zero_priority():
    item_completed = WorkItemPriorityInput(
        item_id="item-1",
        title="Finished Report",
        status="completed",
        deadline_utc=datetime.now(timezone.utc) + timedelta(days=1),
        remaining_hours=0.0,
    )
    res_completed = PriorityEngine.evaluate(item_completed)
    assert res_completed.priority_score == 0.0
    assert res_completed.priority_level == PriorityLevel.LOW
    assert "completed" in res_completed.priority_explanation

    item_cancelled = WorkItemPriorityInput(
        item_id="item-2",
        title="Dropped Project",
        status="cancelled",
        deadline_utc=datetime.now(timezone.utc) + timedelta(days=1),
        remaining_hours=5.0,
    )
    res_cancelled = PriorityEngine.evaluate(item_cancelled)
    assert res_cancelled.priority_score == 0.0
    assert res_cancelled.priority_level == PriorityLevel.LOW


def test_overdue_and_critical_risk_reaches_maximum_priority():
    now = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    item = WorkItemPriorityInput(
        item_id="urgent-1",
        title="Urgent Grant Proposal",
        status="in_progress",
        deadline_utc=now - timedelta(hours=2),  # Overdue
        remaining_hours=6.0,
        importance_weight=1.5,  # Critical importance
        risk_state="overdue",
        risk_ratio=1.4,
    )
    res = PriorityEngine.evaluate(item, current_time=now)
    assert res.priority_score >= 80.0
    assert res.priority_level == PriorityLevel.CRITICAL
    assert res.contributing_factors.urgency_points == 35.0
    assert res.contributing_factors.risk_points == 30.0
    assert res.contributing_factors.importance_points == 20.0
    assert "imminent deadline urgency" in res.priority_explanation or "OVERDUE" in str(res.contributing_factors.details)


def test_distant_safe_task_has_low_priority():
    now = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    item = WorkItemPriorityInput(
        item_id="distant-1",
        title="Distant Research Paper",
        status="todo",
        deadline_utc=now + timedelta(days=45),  # 45 days away
        remaining_hours=2.0,
        importance_weight=1.0,
        risk_state="safe",
        risk_ratio=0.2,
    )
    res = PriorityEngine.evaluate(item, current_time=now)
    assert res.priority_score < 40.0
    assert res.priority_level == PriorityLevel.LOW
    assert res.contributing_factors.urgency_points < 10.0


def test_blocked_task_penalty():
    now = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    unblocked_item = WorkItemPriorityInput(
        item_id="item-unblocked",
        title="Design Spec",
        status="todo",
        deadline_utc=now + timedelta(days=2),
        remaining_hours=4.0,
        importance_weight=1.2,
        is_blocked=False,
    )
    blocked_item = WorkItemPriorityInput(
        item_id="item-blocked",
        title="Design Spec",
        status="todo",
        deadline_utc=now + timedelta(days=2),
        remaining_hours=4.0,
        importance_weight=1.2,
        is_blocked=True,
    )
    res_unblocked = PriorityEngine.evaluate(unblocked_item, current_time=now)
    res_blocked = PriorityEngine.evaluate(blocked_item, current_time=now)

    assert res_blocked.priority_score < res_unblocked.priority_score
    assert res_blocked.contributing_factors.modifiers_points == -20.0
    assert "blocked" in res_blocked.priority_explanation


def test_near_completion_momentum_boost():
    now = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    item_early = WorkItemPriorityInput(
        item_id="item-early",
        title="Lab Experiment",
        status="in_progress",
        deadline_utc=now + timedelta(days=5),
        remaining_hours=1.5,
        completion_pct=20,
    )
    item_near_finish = WorkItemPriorityInput(
        item_id="item-finish",
        title="Lab Experiment",
        status="in_progress",
        deadline_utc=now + timedelta(days=5),
        remaining_hours=1.5,
        completion_pct=85,
    )
    res_early = PriorityEngine.evaluate(item_early, current_time=now)
    res_finish = PriorityEngine.evaluate(item_near_finish, current_time=now)

    assert res_finish.priority_score > res_early.priority_score
    assert res_finish.contributing_factors.modifiers_points == 4.0


def test_ranking_multiple_items_deterministically():
    now = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    item1 = WorkItemPriorityInput(
        item_id="item-1",
        title="Low Priority Distant",
        status="todo",
        deadline_utc=now + timedelta(days=30),
        remaining_hours=2.0,
        importance_weight=0.8,
    )
    item2 = WorkItemPriorityInput(
        item_id="item-2",
        title="Critical Tomorrow",
        status="in_progress",
        deadline_utc=now + timedelta(hours=20),
        remaining_hours=5.0,
        importance_weight=1.5,
        risk_state="at_risk",
        risk_ratio=0.95,
    )
    item3 = WorkItemPriorityInput(
        item_id="item-3",
        title="Moderate Due Next Week",
        status="todo",
        deadline_utc=now + timedelta(days=5),
        remaining_hours=3.0,
        importance_weight=1.0,
    )

    ranked = PriorityEngine.rank_items([item1, item2, item3], current_time=now)
    # The top ranked item must be item2 (Critical Tomorrow)
    assert ranked[0][0].item_id == "item-2"
    assert ranked[0][1].priority_level in {PriorityLevel.HIGH, PriorityLevel.CRITICAL}
    # Second should be item3 (Due Next Week)
    assert ranked[1][0].item_id == "item-3"
    # Last should be item1
    assert ranked[2][0].item_id == "item-1"
