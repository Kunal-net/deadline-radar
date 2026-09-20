import httpx
import uuid
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_clean_user_and_isolation():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    uid_a = uuid.uuid4().hex[:8]
    user_a_email = f"testuser_{uid_a}@deadlineradar.com"
    user_a_pass = "TestPassword123!"

    print("=== TEST 1: Register User A (Clean User) ===")
    res = client.post("/auth/register", json={
        "email": user_a_email,
        "password": user_a_pass,
        "full_name": f"Test User {uid_a}"
    })
    assert res.status_code == 201, f"Failed to register User A: {res.text}"
    token_a = res.json()["tokens"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Verify User A has 0 work items
    res_work = client.get("/work", headers=headers_a)
    assert res_work.status_code == 200, f"Failed to get work: {res_work.text}"
    work_data = res_work.json()
    assert work_data["total"] == 0, f"Expected 0 items, got {work_data['total']}"
    assert len(work_data["items"]) == 0, f"Expected empty items, got {work_data['items']}"
    print("PASS: Clean user has exactly 0 work items.")

    # Verify Today Overview has 0 items
    res_today = client.get("/today/overview", headers=headers_a)
    assert res_today.status_code == 200, f"Failed today overview: {res_today.text}"
    today_data = res_today.json()
    assert today_data["urgent_deadlines_count"] == 0
    assert today_data["today_plan_items"] == []
    assert today_data["now_recommendation"] is None
    assert today_data["next_recommendation"] is None
    print("PASS: Clean user today overview has 0 tasks and no recommendations.")

    # Verify Dashboard Summary has 0 items
    res_summary = client.get("/dashboard/summary", headers=headers_a)
    assert res_summary.status_code == 200
    summary_data = res_summary.json()
    assert summary_data["week_workload_hours"] == 0.0
    assert summary_data["critical_items"] == []
    print("PASS: Clean user dashboard summary has 0 workload hours and 0 critical items.")

    # Verify Timeline Projection has 0 items
    res_timeline = client.get("/timeline/projection?days=14", headers=headers_a)
    assert res_timeline.status_code == 200
    timeline_data = res_timeline.json()
    assert len(timeline_data["items"]) == 0
    print("PASS: Clean user timeline projection has 0 items.")

    print("\n=== TEST 2: Create real work item for User A ===")
    create_payload = {
        "title": "Deadline Radar Integration Test",
        "description": "Real verified work item created via authenticated API",
        "category": "PROJECT",
        "estimated_hours": 2.0,
        "remaining_estimated_hours": 2.0,
        "deadline_utc": "2026-09-25T18:00:00Z",
        "is_hard_deadline": True
    }
    res_create = client.post("/work", headers=headers_a, json=create_payload)
    assert res_create.status_code == 201, f"Failed to create work: {res_create.text}"
    created_item = res_create.json()
    item_id = created_item["id"]
    assert created_item["title"] == "Deadline Radar Integration Test"
    assert created_item["total_estimated_hours"] == 2.0
    print(f"PASS: Created real work item id={item_id}")

    print("\n=== TEST 3: Verify item appears for User A ===")
    res_work_after = client.get("/work", headers=headers_a)
    assert res_work_after.status_code == 200
    data_after = res_work_after.json()
    assert data_after["total"] == 1
    assert data_after["items"][0]["id"] == item_id
    assert data_after["items"][0]["title"] == "Deadline Radar Integration Test"
    print("PASS: Exactly 1 item returned for User A.")

    print("\n=== TEST 4: Edit item for User A ===")
    patch_payload = {
        "title": "Deadline Radar Integration Test - Edited",
        "total_estimated_hours": 3.0
    }
    res_patch = client.patch(f"/work/{item_id}", headers=headers_a, json=patch_payload)
    assert res_patch.status_code == 200, f"Failed to patch work: {res_patch.text}"
    patched_item = res_patch.json()
    assert patched_item["title"] == "Deadline Radar Integration Test - Edited"
    assert patched_item["total_estimated_hours"] == 3.0
    print("PASS: Item edits persisted.")

    print("\n=== TEST 5: Complete item for User A ===")
    res_complete = client.patch(f"/work/{item_id}", headers=headers_a, json={"status": "COMPLETED"})
    assert res_complete.status_code == 200
    assert res_complete.json()["status"].upper() == "COMPLETED"

    res_active = client.get("/work?status=active", headers=headers_a)
    assert res_active.status_code == 200
    assert res_active.json()["total"] == 0
    print("PASS: Completed item correctly filtered out of active work.")

    print("\n=== TEST 6: User Isolation — Register User B ===")
    uid_b = uuid.uuid4().hex[:8]
    user_b_email = f"testuser_{uid_b}@deadlineradar.com"
    user_b_pass = "TestPassword123!"

    res_b = client.post("/auth/register", json={
        "email": user_b_email,
        "password": user_b_pass,
        "full_name": f"Test User {uid_b}"
    })
    assert res_b.status_code == 201
    token_b = res_b.json()["tokens"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B should see 0 items
    res_work_b = client.get("/work", headers=headers_b)
    assert res_work_b.status_code == 200
    assert res_work_b.json()["total"] == 0
    assert len(res_work_b.json()["items"]) == 0

    # User B should not be able to read User A's item
    res_access_b = client.get(f"/work/{item_id}", headers=headers_b)
    assert res_access_b.status_code == 404, f"Expected 404 for User B accessing User A work, got {res_access_b.status_code}"
    print("PASS: Complete User Isolation verified. User B sees 0 items and cannot access User A's item.")

    print("\n=== TEST 7 & 8: Auth Protection & Forced Failure ===")
    # Unauthenticated request
    res_unauth = client.get("/work")
    assert res_unauth.status_code == 401
    print("PASS: Unauthenticated request returns 401 Unauthorized (not demo data).")

    # Invalid token request
    res_invalid = client.get("/work", headers={"Authorization": "Bearer invalid_token_12345"})
    assert res_invalid.status_code == 401
    print("PASS: Invalid token returns 401 Unauthorized.")

    print("\n==========================================")
    print("ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    test_clean_user_and_isolation()
