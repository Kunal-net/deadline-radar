from datetime import date, datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_planning_and_today_overview_flow(client: AsyncClient):
    # 1. Register User
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "planner_user@example.com",
            "password": "Password123!",
            "full_name": "Planner User",
        },
    )
    assert reg_resp.status_code == 201
    token = reg_resp.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add availability template (Monday-Sunday 09:00 - 17:00)
    today = datetime.now(timezone.utc).date()
    avail_resp = await client.put(
        "/api/v1/availability/templates",
        headers=headers,
        json={
            "templates": [
                {
                    "day_of_week": today.weekday(),
                    "start_time": "09:00:00",
                    "end_time": "17:00:00",
                    "capacity_hours": 8.0,
                    "is_available": True,
                }
            ]
        },
    )
    assert avail_resp.status_code == 200

    # 3. Create a high priority work item
    work_resp = await client.post(
        "/api/v1/work",
        headers=headers,
        json={
            "title": "Autonomous AI Agent Project",
            "category": "project",
            "importance_weight": 1.5,
            "deadline": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
            "units": [
                {
                    "title": "Phase 1 - Core Engine",
                    "estimated_hours": 2.0,
                    "sequence_order": 1,
                },
                {
                    "title": "Phase 2 - API Endpoints",
                    "estimated_hours": 1.5,
                    "sequence_order": 2,
                },
            ],
        },
    )
    assert work_resp.status_code == 201
    work_id = work_resp.json()["id"]

    # 4. Generate Daily Plan
    plan_gen_resp = await client.post(
        "/api/v1/planning/generate",
        headers=headers,
        json={
            "target_date": today.isoformat(),
            "max_hours": 4.0,
            "include_interests": True,
        },
    )
    assert plan_gen_resp.status_code == 200
    plan_data = plan_gen_resp.json()["plan"]
    assert plan_data["plan_date"] == today.isoformat()
    assert len(plan_data["items"]) >= 1
    first_item = plan_data["items"][0]
    assert first_item["work_item_id"] == work_id
    item_id = first_item["id"]

    # 5. Retrieve Plan by Date
    get_plan_resp = await client.get(
        f"/api/v1/planning/{today.isoformat()}",
        headers=headers,
    )
    assert get_plan_resp.status_code == 200
    assert get_plan_resp.json()["id"] == plan_data["id"]

    # 6. Update Plan Item
    patch_resp = await client.patch(
        f"/api/v1/planning/items/{item_id}",
        headers=headers,
        json={
            "status": "completed",
            "notes": "Finished testing unit ahead of schedule",
        },
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "completed"
    assert "Finished testing" in patch_resp.json()["notes"]

    # 7. Start a tracking session and inspect Today Overview
    start_sess_resp = await client.post(
        "/api/v1/tracking/sessions/start",
        headers=headers,
        json={"work_item_id": work_id},
    )
    assert start_sess_resp.status_code == 201

    today_resp = await client.get(
        "/api/v1/today/overview",
        headers=headers,
    )
    assert today_resp.status_code == 200
    today_data = today_resp.json()
    assert today_data["date"] == today.isoformat()
    assert today_data["active_session"] is not None
    assert today_data["active_session"]["work_item_id"] == work_id
    assert today_data["day_capacity_hours"] > 0
    assert len(today_data["today_plan_items"]) >= 1
