from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_recalculation_and_notifications_lifecycle(client: AsyncClient):
    # 1. Register User
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "recalc_user@example.com",
            "password": "Password123!",
            "full_name": "Recalc User",
        },
    )
    assert reg_resp.status_code == 201
    token = reg_resp.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a work item with an imminent deadline to trigger risk escalation
    now = datetime.now(timezone.utc)
    work_resp = await client.post(
        "/api/v1/work",
        headers=headers,
        json={
            "title": "Critical Capstone Submission",
            "category": "academic",
            "importance_weight": 2.0,
            "deadline": (now + timedelta(hours=5)).isoformat(),
            "estimated_hours": 12.0,  # 12h of work due in 5h -> severe deficit
        },
    )
    assert work_resp.status_code == 201
    work_id = work_resp.json()["id"]

    # 3. Trigger workload recalculation
    recalc_resp = await client.post(
        "/api/v1/work/recalculate",
        headers=headers,
    )
    assert recalc_resp.status_code == 200
    recalc_data = recalc_resp.json()
    assert recalc_data["items_recalculated"] >= 1

    # 4. Check that proactive notification was dispatched
    notif_resp = await client.get(
        "/api/v1/notifications",
        headers=headers,
    )
    assert notif_resp.status_code == 200
    notif_data = notif_resp.json()
    assert notif_data["total"] >= 1
    assert notif_data["unread_count"] >= 1
    first_notif = notif_data["items"][0]
    notif_id = first_notif["id"]
    assert first_notif["is_read"] is False

    # 5. Mark single notification as read
    read_resp = await client.patch(
        f"/api/v1/notifications/{notif_id}/read",
        headers=headers,
    )
    assert read_resp.status_code == 200
    assert read_resp.json()["is_read"] is True

    # 6. Verify mark all read endpoint
    mark_all_resp = await client.post(
        "/api/v1/notifications/mark-all-read",
        headers=headers,
    )
    assert mark_all_resp.status_code == 200
    assert "marked_read_count" in mark_all_resp.json()
