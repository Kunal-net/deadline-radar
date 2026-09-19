from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.fixture
async def insights_user_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "telemetry_user@university.edu",
            "password": "Password123!",
            "full_name": "Telemetry User",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_insights_unauthorized(client: AsyncClient):
    res = await client.get("/api/v1/insights/summary")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_insights_cold_start(client: AsyncClient, insights_user_headers: dict):
    res = await client.get(
        "/api/v1/insights/summary",
        headers=insights_user_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_completed_tasks"] == 0
    assert data["overall_pace_factor"] == 1.0
    assert data["learning_status"] == "cold_start"
    assert data["confidence_level"] == "low"
    assert data["rolling_bias"] == "accurate"


@pytest.mark.asyncio
async def test_insights_learning_loop_and_recalibration(
    client: AsyncClient, insights_user_headers: dict
):
    now = datetime.now(timezone.utc)

    # Simulate 3 completed academic assignments where user took 1.5x expected time
    for i in range(3):
        # 1. Create work item
        create_res = await client.post(
            "/api/v1/work",
            json={
                "title": f"Academic Assignment {i+1}",
                "category": "academic",
                "estimated_effort_hours": 2.0,
                "deadline_utc": (now + timedelta(days=2)).isoformat(),
                "initial_units": [
                    {
                        "sequence_order": 1,
                        "title": f"Phase 1 for Assignment {i+1}",
                        "estimated_minutes": 120,
                    }
                ],
            },
            headers=insights_user_headers,
        )
        assert create_res.status_code == 201
        work_item = create_res.json()
        work_id = work_item["id"]
        unit_id = work_item["units"][0]["id"]

        # 2. Log actual time of 3 hours (180 mins) -> actual > estimated (pace = 1.5)
        entry_res = await client.post(
            "/api/v1/tracking/entries",
            json={
                "work_item_id": work_id,
                "work_unit_id": unit_id,
                "start_time_utc": (now - timedelta(hours=3)).isoformat(),
                "end_time_utc": now.isoformat(),
                "duration_minutes": 180,
            },
            headers=insights_user_headers,
        )
        assert entry_res.status_code == 201

        # 3. Mark unit and work item completed
        unit_done_res = await client.patch(
            f"/api/v1/work/{work_id}/units/{unit_id}",
            json={"is_completed": True},
            headers=insights_user_headers,
        )
        assert unit_done_res.status_code == 200

        work_done_res = await client.patch(
            f"/api/v1/work/{work_id}",
            json={"status": "completed"},
            headers=insights_user_headers,
        )
        assert work_done_res.status_code == 200

    # 4. Trigger pace recalibration
    recal_res = await client.post(
        "/api/v1/insights/recalibrate-pace",
        headers=insights_user_headers,
    )
    assert recal_res.status_code == 200
    recal_data = recal_res.json()
    assert recal_data["observations_processed"] >= 3
    assert recal_data["overall_pace_factor"] > 1.0  # Learned that user takes longer
    assert recal_data["learning_status"] in ["calibrating", "calibrated"]

    # 5. Fetch insights summary
    summary_res = await client.get(
        "/api/v1/insights/summary",
        headers=insights_user_headers,
    )
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_completed_tasks"] == 3
    assert summary["total_tracked_hours"] >= 8.0
    assert summary["average_signed_error_hours"] > 0.0  # Consistently underestimating effort
    assert summary["rolling_bias"] == "underestimating"
    assert len(summary["category_breakdowns"]) >= 1
    acad_breakdown = next(b for b in summary["category_breakdowns"] if b["category"] == "academic")
    assert acad_breakdown["pace_factor"] > 1.0
    assert "longer" in acad_breakdown["interpretation"].lower()
