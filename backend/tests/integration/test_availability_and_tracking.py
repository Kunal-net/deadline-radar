from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers_tracker_a(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "tracker_a@university.edu",
            "password": "Password123!",
            "full_name": "Tracker A",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_tracker_b(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "tracker_b@university.edu",
            "password": "Password123!",
            "full_name": "Tracker B",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_availability_templates_and_blocks(
    client: AsyncClient,
    auth_headers_tracker_a: dict,
):
    # 1. Get default seeded templates (7 days)
    get_res = await client.get("/api/v1/availability/templates", headers=auth_headers_tracker_a)
    assert get_res.status_code == 200
    templates = get_res.json()["templates"]
    assert len(templates) == 7

    # 2. Replace templates
    new_templates = [
        {"day_of_week": 1, "start_time": "17:00:00", "end_time": "21:00:00", "capacity_hours": 4.0, "is_available": True},
        {"day_of_week": 2, "start_time": "18:00:00", "end_time": "22:00:00", "capacity_hours": 4.0, "is_available": True},
    ]
    put_res = await client.put(
        "/api/v1/availability/templates",
        json={"templates": new_templates},
        headers=auth_headers_tracker_a,
    )
    assert put_res.status_code == 200
    assert len(put_res.json()["templates"]) == 2

    # 3. Create schedule block (blackout)
    now = datetime.now(timezone.utc)
    block_res = await client.post(
        "/api/v1/availability/blocks",
        json={
            "title": "Dentist Appointment",
            "block_type": "hard_commitment",
            "start_time": (now + timedelta(days=1)).isoformat(),
            "end_time": (now + timedelta(days=1, hours=2)).isoformat(),
            "is_blackout": True,
        },
        headers=auth_headers_tracker_a,
    )
    assert block_res.status_code == 201
    block_id = block_res.json()["id"]

    # 4. List blocks
    list_blocks = await client.get("/api/v1/availability/blocks", headers=auth_headers_tracker_a)
    assert len(list_blocks.json()["blocks"]) == 1

    # 5. Delete block
    del_res = await client.delete(f"/api/v1/availability/blocks/{block_id}", headers=auth_headers_tracker_a)
    assert del_res.status_code == 204


@pytest.mark.asyncio
async def test_stopwatch_and_manual_time_tracking(
    client: AsyncClient,
    auth_headers_tracker_a: dict,
    auth_headers_tracker_b: dict,
):
    # 1. Create a work item for tracking
    work_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Machine Learning Training",
            "category": "academic",
            "estimated_hours": 5.0,
            "initial_units": [
                {"title": "Epoch 1-50", "estimated_hours": 5.0}
            ],
        },
        headers=auth_headers_tracker_a,
    )
    work = work_res.json()
    work_id = work["id"]
    unit_id = work["units"][0]["id"]

    # 2. Check no active session initially
    init_active = await client.get("/api/v1/tracking/sessions/active", headers=auth_headers_tracker_a)
    assert init_active.status_code == 200
    assert init_active.json() is None

    # 3. Start stopwatch session
    start_res = await client.post(
        "/api/v1/tracking/sessions/start",
        json={"work_item_id": work_id, "work_unit_id": unit_id, "notes": "Initial run"},
        headers=auth_headers_tracker_a,
    )
    assert start_res.status_code == 201
    session_data = start_res.json()["session"]
    assert session_data["work_item_id"] == work_id
    assert session_data["is_active"] is True

    # 4. Second session start triggers 409 Conflict
    conflict_res = await client.post(
        "/api/v1/tracking/sessions/start",
        json={"work_item_id": work_id},
        headers=auth_headers_tracker_a,
    )
    assert conflict_res.status_code == 409
    assert conflict_res.json()["error"]["code"] == "ACTIVE_SESSION_EXISTS"

    # 5. User B cannot see User A's active session
    user_b_active = await client.get("/api/v1/tracking/sessions/active", headers=auth_headers_tracker_b)
    assert user_b_active.status_code == 200
    assert user_b_active.json() is None

    # 6. Stop active session
    stop_res = await client.post(
        "/api/v1/tracking/sessions/stop",
        json={"notes": "Finished benchmark run"},
        headers=auth_headers_tracker_a,
    )
    assert stop_res.status_code == 200
    stop_data = stop_res.json()
    assert "time_entry" in stop_data
    entry = stop_data["time_entry"]
    assert entry["work_item_id"] == work_id
    assert entry["source"] == "stopwatch"

    # Verify session was cleared
    after_stop = await client.get("/api/v1/tracking/sessions/active", headers=auth_headers_tracker_a)
    assert after_stop.json() is None

    # 7. Create manual time entry
    now = datetime.now(timezone.utc)
    manual_res = await client.post(
        "/api/v1/tracking/entries",
        json={
            "work_item_id": work_id,
            "work_unit_id": unit_id,
            "start_time": (now - timedelta(hours=2)).isoformat(),
            "end_time": (now - timedelta(hours=1)).isoformat(),
            "duration_minutes": 60,
            "notes": "Offline reading",
        },
        headers=auth_headers_tracker_a,
    )
    assert manual_res.status_code == 201
    assert manual_res.json()["duration_hours"] == 1.0

    # 8. List entries with pagination
    entries_res = await client.get(f"/api/v1/tracking/entries?work_item_id={work_id}", headers=auth_headers_tracker_a)
    assert entries_res.status_code == 200
    assert entries_res.json()["total"] == 2
