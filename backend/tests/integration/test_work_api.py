from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers_user_a(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "work_author_a@university.edu",
            "password": "Password123!",
            "full_name": "Author A",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_user_b(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "work_author_b@university.edu",
            "password": "Password123!",
            "full_name": "Author B",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_work_crud_and_units_lifecycle(
    client: AsyncClient,
    auth_headers_user_a: dict,
    auth_headers_user_b: dict,
):
    # 1. Create work item with initial subtasks
    deadline = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    create_payload = {
        "title": "Compiler Construction Assignment 3",
        "description": "Implement lexical analyzer and AST generation",
        "category": "academic",
        "deadline_utc": deadline,
        "is_hard_deadline": True,
        "importance_weight": 1.2,
        "initial_units": [
            {"title": "Write Flex regex patterns", "estimated_hours": 2.0},
            {"title": "Implement AST node classes", "estimated_hours": 2.5},
            {"title": "Write integration test suite", "estimated_hours": 1.5},
        ],
    }
    create_res = await client.post("/api/v1/work", json=create_payload, headers=auth_headers_user_a)
    assert create_res.status_code == 201
    item = create_res.json()
    work_id = item["id"]
    assert item["title"] == "Compiler Construction Assignment 3"
    assert item["total_estimated_hours"] == 6.0
    assert item["remaining_estimated_hours"] == 6.0
    assert item["units_count"] == 3
    assert item["completed_units_count"] == 0
    assert item["completion_pct"] == 0

    # 2. List work items with filtering
    list_res = await client.get("/api/v1/work?category=academic&status=todo", headers=auth_headers_user_a)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] == 1
    assert list_data["items"][0]["id"] == work_id

    # 3. Get single work item with units
    get_res = await client.get(f"/api/v1/work/{work_id}", headers=auth_headers_user_a)
    assert get_res.status_code == 200
    units = get_res.json()["units"]
    assert len(units) == 3
    unit_1_id = units[0]["id"]
    unit_2_id = units[1]["id"]
    unit_3_id = units[2]["id"]

    # 4. Complete unit 1
    patch_unit_res = await client.patch(
        f"/api/v1/work/{work_id}/units/{unit_1_id}",
        json={"is_completed": True, "actual_hours": 2.2},
        headers=auth_headers_user_a,
    )
    assert patch_unit_res.status_code == 200
    assert patch_unit_res.json()["is_completed"] is True

    # Check work item recalculation: remaining effort should be 6.0 - 2.0 = 4.0
    refreshed_item = await client.get(f"/api/v1/work/{work_id}", headers=auth_headers_user_a)
    assert refreshed_item.json()["remaining_estimated_hours"] == 4.0
    assert refreshed_item.json()["completed_units_count"] == 1
    assert refreshed_item.json()["completion_pct"] == 33

    # 5. Reorder units
    reorder_res = await client.put(
        f"/api/v1/work/{work_id}/units/reorder",
        json={
            "unit_orders": [
                {"unit_id": unit_3_id, "sequence_order": 1},
                {"unit_id": unit_2_id, "sequence_order": 2},
                {"unit_id": unit_1_id, "sequence_order": 3},
            ]
        },
        headers=auth_headers_user_a,
    )
    assert reorder_res.status_code == 200
    reordered_units = reorder_res.json()["units"]
    assert reordered_units[0]["id"] == unit_3_id
    assert reordered_units[0]["sequence_order"] == 1

    # 6. Add a new unit dynamically
    add_unit_res = await client.post(
        f"/api/v1/work/{work_id}/units",
        json={"title": "Documentation & README", "sequence_order": 4, "estimated_hours": 1.0},
        headers=auth_headers_user_a,
    )
    assert add_unit_res.status_code == 201

    refreshed_item2 = await client.get(f"/api/v1/work/{work_id}", headers=auth_headers_user_a)
    assert refreshed_item2.json()["total_estimated_hours"] == 7.0
    assert refreshed_item2.json()["remaining_estimated_hours"] == 5.0
    assert refreshed_item2.json()["units_count"] == 4

    # 7. Strict cross-user isolation: User B cannot view or mutate User A's work
    unauth_get = await client.get(f"/api/v1/work/{work_id}", headers=auth_headers_user_b)
    assert unauth_get.status_code == 404

    unauth_patch = await client.patch(
        f"/api/v1/work/{work_id}",
        json={"title": "Hacked Title"},
        headers=auth_headers_user_b,
    )
    assert unauth_patch.status_code == 404

    unauth_del = await client.delete(f"/api/v1/work/{work_id}", headers=auth_headers_user_b)
    assert unauth_del.status_code == 404

    # 8. User A deletes work item
    del_res = await client.delete(f"/api/v1/work/{work_id}", headers=auth_headers_user_a)
    assert del_res.status_code == 204

    # Verify 404 after deletion
    get_after_del = await client.get(f"/api/v1/work/{work_id}", headers=auth_headers_user_a)
    assert get_after_del.status_code == 404
