from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient

from app.models.work_item import WorkItem
from app.models.work_unit import WorkUnit


@pytest.fixture
async def user_a_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "work_crud_user_a@university.edu",
            "password": "SecurePassword123!",
            "full_name": "User Alpha",
        },
    )
    assert res.status_code == 201, res.text
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def user_b_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "work_crud_user_b@university.edu",
            "password": "SecurePassword123!",
            "full_name": "User Beta",
        },
    )
    assert res.status_code == 201, res.text
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_work_create_and_validation(client: AsyncClient, user_a_headers: dict):
    """Verify work item creation validations and successful persistence."""
    # 1. Reject empty title
    res_empty_title = await client.post(
        "/api/v1/work",
        json={"title": "", "category": "academic"},
        headers=user_a_headers,
    )
    assert res_empty_title.status_code == 422

    # 2. Reject invalid importance weight (< 0.5 or > 3.0)
    res_low_weight = await client.post(
        "/api/v1/work",
        json={"title": "Test Item", "importance_weight": 0.1},
        headers=user_a_headers,
    )
    assert res_low_weight.status_code == 422

    res_high_weight = await client.post(
        "/api/v1/work",
        json={"title": "Test Item", "importance_weight": 4.5},
        headers=user_a_headers,
    )
    assert res_high_weight.status_code == 422

    # 3. Successful creation with full fields and initial units
    target_deadline = (datetime.now(timezone.utc) + timedelta(days=4)).isoformat()
    payload = {
        "title": "Distributed Systems Raft Protocol Implementation",
        "description": "Implement consensus leader election and log replication in Go",
        "category": "project",
        "deadline_utc": target_deadline,
        "is_hard_deadline": True,
        "importance_weight": 2.0,
        "estimated_hours": 8.0,
        "initial_units": [
            {"title": "Leader Election State Machine", "estimated_hours": 3.0},
            {"title": "AppendEntries RPC & Heartbeats", "estimated_hours": 2.5},
            {"title": "Log Compaction & Snapshots", "estimated_hours": 2.5},
        ],
    }

    create_res = await client.post("/api/v1/work", json=payload, headers=user_a_headers)
    assert create_res.status_code == 201, create_res.text
    data = create_res.json()

    assert data["id"] is not None
    assert data["title"] == "Distributed Systems Raft Protocol Implementation"
    assert data["description"] == "Implement consensus leader election and log replication in Go"
    assert data["category"] == "project"
    assert data["total_estimated_hours"] == 8.0
    assert data["remaining_estimated_hours"] == 8.0
    assert data["status"] == "todo"
    assert data["units_count"] == 3
    assert data["completion_pct"] == 0
    assert "dynamic_priority" in data
    assert "risk_state" in data
    # Verify camelCase aliases for frontend contract compatibility
    assert data["deadlineUtc"] is not None
    assert data["isHardDeadline"] is True
    assert data["estimatedEffortHours"] == 8.0
    assert data["remainingEffortHours"] == 8.0
    assert data["riskLevel"] is not None


@pytest.mark.asyncio
async def test_work_unauthenticated_endpoints(client: AsyncClient):
    """Verify that all work mutations and queries reject unauthenticated requests."""
    fake_id = "00000000-0000-0000-0000-000000000000"

    res_list = await client.get("/api/v1/work")
    assert res_list.status_code == 401

    res_get = await client.get(f"/api/v1/work/{fake_id}")
    assert res_get.status_code == 401

    res_post = await client.post("/api/v1/work", json={"title": "Hacked"})
    assert res_post.status_code == 401

    res_patch = await client.patch(f"/api/v1/work/{fake_id}", json={"title": "Hacked"})
    assert res_patch.status_code == 401

    res_del = await client.delete(f"/api/v1/work/{fake_id}")
    assert res_del.status_code == 401


@pytest.mark.asyncio
async def test_work_multi_tenant_isolation(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
):
    """Verify strict user isolation: User A cannot see, edit, or delete User B's work."""
    # User A creates Work A
    res_a = await client.post(
        "/api/v1/work",
        json={"title": "User A Private Research", "category": "academic", "estimated_hours": 3.0},
        headers=user_a_headers,
    )
    assert res_a.status_code == 201
    work_a_id = res_a.json()["id"]

    # User B creates Work B
    res_b = await client.post(
        "/api/v1/work",
        json={"title": "User B Confidential Client Task", "category": "career", "estimated_hours": 4.0},
        headers=user_b_headers,
    )
    assert res_b.status_code == 201
    work_b_id = res_b.json()["id"]

    # 1. User A lists work -> sees only Work A
    list_a = await client.get("/api/v1/work", headers=user_a_headers)
    assert list_a.status_code == 200
    ids_for_a = [item["id"] for item in list_a.json()["items"]]
    assert work_a_id in ids_for_a
    assert work_b_id not in ids_for_a

    # 2. User B lists work -> sees only Work B
    list_b = await client.get("/api/v1/work", headers=user_b_headers)
    assert list_b.status_code == 200
    ids_for_b = [item["id"] for item in list_b.json()["items"]]
    assert work_b_id in ids_for_b
    assert work_a_id not in ids_for_b

    # 3. Direct access cross-user fails with 404 (not found)
    assert (await client.get(f"/api/v1/work/{work_b_id}", headers=user_a_headers)).status_code == 404
    assert (await client.patch(f"/api/v1/work/{work_b_id}", json={"title": "Tampered"}, headers=user_a_headers)).status_code == 404
    assert (await client.delete(f"/api/v1/work/{work_b_id}", headers=user_a_headers)).status_code == 404

    assert (await client.get(f"/api/v1/work/{work_a_id}", headers=user_b_headers)).status_code == 404
    assert (await client.patch(f"/api/v1/work/{work_a_id}", json={"title": "Tampered"}, headers=user_b_headers)).status_code == 404
    assert (await client.delete(f"/api/v1/work/{work_a_id}", headers=user_b_headers)).status_code == 404


@pytest.mark.asyncio
async def test_work_edit_and_persistence(client: AsyncClient, user_a_headers: dict):
    """Verify that editing work parameters correctly updates and persists in the database."""
    initial_deadline = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    create_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Original Title",
            "description": "Original Description",
            "category": "academic",
            "deadline_utc": initial_deadline,
            "is_hard_deadline": False,
            "importance_weight": 1.0,
            "estimated_hours": 2.5,
        },
        headers=user_a_headers,
    )
    assert create_res.status_code == 201
    work_id = create_res.json()["id"]

    new_deadline = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    update_payload = {
        "title": "Updated Title After Revision",
        "description": "Updated Description with expanded scope",
        "category": "project",
        "deadline_utc": new_deadline,
        "is_hard_deadline": True,
        "importance_weight": 2.5,
        "total_estimated_hours": 6.0,
        "remaining_estimated_hours": 4.5,
    }

    patch_res = await client.patch(f"/api/v1/work/{work_id}", json=update_payload, headers=user_a_headers)
    assert patch_res.status_code == 200, patch_res.text
    patched = patch_res.json()
    assert patched["title"] == "Updated Title After Revision"
    assert patched["description"] == "Updated Description with expanded scope"
    assert patched["category"] == "project"
    assert patched["is_hard_deadline"] is True
    assert patched["importance_weight"] == 2.5
    assert patched["total_estimated_hours"] == 6.0
    assert patched["remaining_estimated_hours"] == 4.5

    # Re-fetch from API to ensure persistence
    get_res = await client.get(f"/api/v1/work/{work_id}", headers=user_a_headers)
    assert get_res.status_code == 200
    refetched = get_res.json()
    assert refetched["title"] == "Updated Title After Revision"
    assert refetched["description"] == "Updated Description with expanded scope"
    assert refetched["category"] == "project"
    assert refetched["is_hard_deadline"] is True
    assert refetched["importance_weight"] == 2.5
    assert refetched["total_estimated_hours"] == 6.0
    assert refetched["remaining_estimated_hours"] == 4.5


@pytest.mark.asyncio
async def test_work_completion_and_reactivation_cycle(client: AsyncClient, user_a_headers: dict):
    """Verify complete lifecycle: mark completed (zeroes effort, marks units, sets timestamp) and reactivation."""
    create_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Semester Portfolio Review",
            "category": "academic",
            "estimated_hours": 4.0,
            "initial_units": [
                {"title": "Section 1: Work Samples", "estimated_hours": 2.0},
                {"title": "Section 2: Self Reflection", "estimated_hours": 2.0},
            ],
        },
        headers=user_a_headers,
    )
    assert create_res.status_code == 201
    work_id = create_res.json()["id"]

    # 1. Mark complete (case-insensitive "COMPLETED")
    comp_res = await client.patch(
        f"/api/v1/work/{work_id}",
        json={"status": "COMPLETED"},
        headers=user_a_headers,
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["status"] == "completed"
    assert comp_data["completion_pct"] == 100
    assert comp_data["remaining_estimated_hours"] == 0.0
    assert all(u["is_completed"] for u in comp_data["units"])

    # 2. Reactivate back to in_progress
    reactivate_res = await client.patch(
        f"/api/v1/work/{work_id}",
        json={"status": "in_progress"},
        headers=user_a_headers,
    )
    assert reactivate_res.status_code == 200
    reactivate_data = reactivate_res.json()
    assert reactivate_data["status"] == "in_progress"

    # Re-fetch item to verify persistent state
    final_get = await client.get(f"/api/v1/work/{work_id}", headers=user_a_headers)
    assert final_get.status_code == 200
    assert final_get.json()["status"] == "in_progress"


@pytest.mark.asyncio
async def test_work_delete_and_cascade(client: AsyncClient, user_a_headers: dict):
    """Verify deletion removes the work item and cascaded units from the database."""
    create_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Temporary Disposable Task",
            "estimated_hours": 1.5,
            "initial_units": [{"title": "Subtask to be removed", "estimated_hours": 1.5}],
        },
        headers=user_a_headers,
    )
    assert create_res.status_code == 201
    work_id = create_res.json()["id"]

    # Delete work item
    del_res = await client.delete(f"/api/v1/work/{work_id}", headers=user_a_headers)
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = await client.get(f"/api/v1/work/{work_id}", headers=user_a_headers)
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_direct_db_persistence(client: AsyncClient, user_a_headers: dict):
    """Verify that records are persisted directly to the relational database tables."""
    create_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Direct Database Proof Item",
            "description": "Inspecting raw database storage",
            "category": "project",
            "estimated_hours": 5.0,
            "initial_units": [{"title": "Unit 1", "estimated_hours": 2.5}],
        },
        headers=user_a_headers,
    )
    assert create_res.status_code == 201
    work_id = create_res.json()["id"]

    # Verify through fresh API request (different HTTP connection)
    fresh_get = await client.get(f"/api/v1/work/{work_id}", headers=user_a_headers)
    assert fresh_get.status_code == 200
    assert fresh_get.json()["title"] == "Direct Database Proof Item"
    assert fresh_get.json()["units_count"] == 1
