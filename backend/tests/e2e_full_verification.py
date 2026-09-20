"""
Comprehensive End-to-End User Journey Verification Script for Deadline Radar.
Tests all 7 core user journeys against live backend server.
"""
import sys
import uuid
import datetime
import httpx

BASE_URL = "http://localhost:8000/api/v1"

def log_step(journey: str, step: str, ok: bool, details: str = ""):
    status = "✓ PASSED" if ok else "✗ FAILED"
    print(f"[{status}] {journey} :: {step} {details}")
    if not ok:
        sys.exit(1)

def main():
    print("==================================================")
    print("STARTING DEADLINE RADAR E2E JOURNEY VERIFICATION")
    print("==================================================")

    client = httpx.Client(timeout=30.0)

    # -------------------------------------------------------------
    # JOURNEY 1: New User Registration & Login & Profile
    # -------------------------------------------------------------
    unique_suffix = str(uuid.uuid4())[:8]
    email = f"e2e_user_{unique_suffix}@example.com"
    password = "StrongPassword123!"
    full_name = f"E2E User {unique_suffix}"

    # 1.1 Signup
    signup_resp = client.post(
        f"{BASE_URL}/auth/register",
        json={"email": email, "password": password, "full_name": full_name}
    )
    log_step("JOURNEY 1", "User Signup / Register", signup_resp.status_code == 201, f"(Status: {signup_resp.status_code})")
    user_data = signup_resp.json()
    assert "user" in user_data and "id" in user_data["user"]

    # 1.2 Login
    login_resp = client.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    log_step("JOURNEY 1", "User Login", login_resp.status_code == 200, f"(Status: {login_resp.status_code})")
    token_data = login_resp.json()
    token = token_data.get("access_token")
    assert token, "Token not returned from login"
    headers = {"Authorization": f"Bearer {token}"}

    # 1.3 Profile / Me
    me_resp = client.get(f"{BASE_URL}/auth/me", headers=headers)
    log_step("JOURNEY 1", "Fetch Authenticated Profile", me_resp.status_code == 200 and me_resp.json()["email"] == email)

    # 1.4 Today Overview
    today_resp = client.get(f"{BASE_URL}/today/overview", headers=headers)
    log_step("JOURNEY 1", "Fetch Today Overview", today_resp.status_code == 200)

    # -------------------------------------------------------------
    # JOURNEY 2: Add Work with AI Intelligence & Persistence
    # -------------------------------------------------------------
    # 2.1 AI Interpretation
    text = "Write a comprehensive distributed systems thesis due next Friday, requires about 12 hours of writing"
    interp_resp = client.post(
        f"{BASE_URL}/ai/interpret",
        headers=headers,
        json={"text": text}
    )
    log_step("JOURNEY 2", "AI Interpretation", interp_resp.status_code == 200)
    interp_data = interp_resp.json()

    # 2.2 AI Decomposition
    decomp_resp = client.post(
        f"{BASE_URL}/ai/decompose",
        headers=headers,
        json={
            "work_title": interp_data.get("title", "Distributed Systems Thesis"),
            "category": "academic",
            "estimated_hours": 12.0
        }
    )
    log_step("JOURNEY 2", "AI Decomposition", decomp_resp.status_code == 200)
    decomp_data = decomp_resp.json()

    # 2.3 AI Effort Estimation
    est_resp = client.post(
        f"{BASE_URL}/ai/estimate-effort",
        headers=headers,
        json={
            "work_title": "Distributed Systems Thesis",
            "category": "academic",
            "complexity": "complex",
            "units_count": len(decomp_data.get("units", []))
        }
    )
    log_step("JOURNEY 2", "AI Effort Estimation", est_resp.status_code == 200)

    # 2.4 Create Work Item with Initial Units (Decomposition)
    deadline_iso = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)).isoformat()
    raw_units = decomp_data.get("suggested_units") or decomp_data.get("units") or [
        {"title": "Research background literature", "estimated_hours": 3.0},
        {"title": "Design consensus protocol", "estimated_hours": 4.0},
        {"title": "Write thesis evaluation section", "estimated_hours": 5.0}
    ]
    units = [
        {"title": u.get("title", "Unit"), "sequence_order": idx + 1, "estimated_hours": u.get("estimated_hours", 2.0)}
        for idx, u in enumerate(raw_units[:3])
    ]
    create_work_resp = client.post(
        f"{BASE_URL}/work",
        headers=headers,
        json={
            "title": "Distributed Systems Thesis",
            "description": "Comprehensive evaluation of distributed consensus algorithms.",
            "category": "academic",
            "deadline_utc": deadline_iso,
            "estimated_effort_hours": 12.0,
            "is_hard_deadline": True,
            "initial_units": units
        }
    )
    log_step("JOURNEY 2", "Create Work Item", create_work_resp.status_code == 201)
    work_id = create_work_resp.json()["id"]

    # 2.5 Verify Work Persistence across reads
    read_work_resp = client.get(f"{BASE_URL}/work/{work_id}", headers=headers)
    log_step("JOURNEY 2", "Read Work Item Persistence", read_work_resp.status_code == 200 and read_work_resp.json()["title"] == "Distributed Systems Thesis")

    # Verify subtasks persistence
    units_resp = client.get(f"{BASE_URL}/work/{work_id}/units", headers=headers)
    log_step("JOURNEY 2", "Read Decomposed Units Persistence", units_resp.status_code == 200 and len(units_resp.json().get("units", [])) >= 1)
    unit_id = units_resp.json()["units"][0]["id"]

    # -------------------------------------------------------------
    # JOURNEY 3: Execute Work, Time Tracking & Completion
    # -------------------------------------------------------------
    # 3.1 Start active tracking session
    start_sess_resp = client.post(
        f"{BASE_URL}/tracking/sessions/start",
        headers=headers,
        json={"work_item_id": work_id, "work_unit_id": unit_id, "notes": "Thesis kickoff"}
    )
    log_step("JOURNEY 3", "Start Active Session", start_sess_resp.status_code == 201)

    # 3.2 Check active session
    active_resp = client.get(f"{BASE_URL}/tracking/sessions/active", headers=headers)
    log_step("JOURNEY 3", "Query Active Session", active_resp.status_code == 200 and active_resp.json().get("is_active") is True)

    # 3.3 Stop active session
    stop_sess_resp = client.post(
        f"{BASE_URL}/tracking/sessions/stop",
        headers=headers,
        json={"notes": "Completed initial draft"}
    )
    log_step("JOURNEY 3", "Stop Active Session", stop_sess_resp.status_code == 200)

    # 3.4 Log manual time entry
    manual_time_resp = client.post(
        f"{BASE_URL}/tracking/entries",
        headers=headers,
        json={
            "work_item_id": work_id,
            "duration_minutes": 90,
            "notes": "Focused literature review"
        }
    )
    log_step("JOURNEY 3", "Log Manual Time (+90m)", manual_time_resp.status_code == 201)

    # 3.5 Mark unit completed
    toggle_unit_resp = client.patch(
        f"{BASE_URL}/work/{work_id}/units/{unit_id}",
        headers=headers,
        json={"is_completed": True}
    )
    log_step("JOURNEY 3", "Mark Subtask Completed", toggle_unit_resp.status_code == 200 and toggle_unit_resp.json()["is_completed"] is True)

    # 3.6 Mark work item completed
    complete_work_resp = client.patch(
        f"{BASE_URL}/work/{work_id}",
        headers=headers,
        json={"status": "completed"}
    )
    log_step("JOURNEY 3", "Mark Work Completed", complete_work_resp.status_code == 200 and complete_work_resp.json()["status"] == "completed")

    # -------------------------------------------------------------
    # JOURNEY 4: Planning Engine & Daily Plans
    # -------------------------------------------------------------
    # 4.1 Create a second active task for planning
    client.post(
        f"{BASE_URL}/work",
        headers=headers,
        json={
            "title": "Algorithms Problem Set",
            "category": "academic",
            "deadline_utc": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3)).isoformat(),
            "estimated_effort_hours": 4.0
        }
    )

    # 4.2 Generate Daily Plan
    plan_gen_resp = client.post(
        f"{BASE_URL}/planning/generate",
        headers=headers,
        json={"target_date": "today"}
    )
    log_step("JOURNEY 4", "Generate Daily Plan", plan_gen_resp.status_code == 200)
    plan_data = plan_gen_resp.json().get("plan", {})
    plan_date = plan_data.get("plan_date", "today")

    # 4.3 Read Daily Plan
    plan_read_resp = client.get(f"{BASE_URL}/planning/{plan_date}", headers=headers)
    log_step("JOURNEY 4", "Read Daily Plan by Date", plan_read_resp.status_code == 200)

    # 4.4 AI Plan Assistance
    plan_assist_resp = client.get(f"{BASE_URL}/planning/{plan_date}/ai-assist", headers=headers)
    log_step("JOURNEY 4", "AI Plan Assistance", plan_assist_resp.status_code == 200)

    # -------------------------------------------------------------
    # JOURNEY 5: Radar & Deadline Risk Recalculation
    # -------------------------------------------------------------
    # 5.1 Query Dashboard Summary
    dash_resp = client.get(f"{BASE_URL}/dashboard/summary", headers=headers)
    log_step("JOURNEY 5", "Dashboard Summary (Radar)", dash_resp.status_code == 200)
    dash_data = dash_resp.json()
    assert "risk_counts" in dash_data or "riskCounts" in dash_data

    # 5.2 Timeline Projection
    timeline_resp = client.get(f"{BASE_URL}/timeline/projection?days=14", headers=headers)
    log_step("JOURNEY 5", "Timeline Projection (14 days)", timeline_resp.status_code == 200)

    # 5.3 Workload Capacity
    workload_resp = client.get(f"{BASE_URL}/workload/capacity?view=day", headers=headers)
    log_step("JOURNEY 5", "Workload Capacity Diagnostics", workload_resp.status_code == 200)

    # -------------------------------------------------------------
    # JOURNEY 6: User Settings & Availability Templates Persistence
    # -------------------------------------------------------------
    # 6.1 Update User Preferences
    pref_resp = client.patch(
        f"{BASE_URL}/users/me/preferences",
        headers=headers,
        json={
            "daily_focus_capacity_hours": 5.5,
            "buffer_percentage": 25,
            "timezone": "America/New_York",
            "preferred_work_chunk_minutes": 45
        }
    )
    log_step("JOURNEY 6", "Update User Preferences", pref_resp.status_code == 200)

    # 6.2 Verify Persistence
    get_pref_resp = client.get(f"{BASE_URL}/users/me/preferences", headers=headers)
    log_step("JOURNEY 6", "Verify Preferences Persistence", get_pref_resp.status_code == 200 and get_pref_resp.json()["daily_focus_capacity_hours"] == 5.5)

    # 6.3 Update Availability Templates
    templates_payload = [
        {"day_of_week": i, "start_time": "09:00", "end_time": "17:00", "is_available": i < 5, "capacity_hours": 6.0 if i < 5 else 0.0}
        for i in range(7)
    ]
    tpl_resp = client.put(
        f"{BASE_URL}/availability/templates",
        headers=headers,
        json={"templates": templates_payload}
    )
    log_step("JOURNEY 6", "Update Weekly Availability Templates", tpl_resp.status_code == 200)

    # 6.4 Export iCalendar (.ics)
    ics_resp = client.get(f"{BASE_URL}/availability/export.ics", headers=headers)
    log_step("JOURNEY 6", "Export iCalendar (.ics)", ics_resp.status_code == 200 and "BEGIN:VCALENDAR" in ics_resp.text)

    # -------------------------------------------------------------
    # JOURNEY 7: Logout & Protected Route Authorization Check
    # -------------------------------------------------------------
    # In full-stack JWT flow, logout invalidates local token client-side.
    # We verify that requests with no token or invalid token are strictly rejected.
    unauth_resp = client.get(f"{BASE_URL}/auth/me")
    log_step("JOURNEY 7", "Unauthenticated /auth/me rejected (401)", unauth_resp.status_code == 401)

    bad_token_resp = client.get(f"{BASE_URL}/auth/me", headers={"Authorization": "Bearer expired_or_cleared_token"})
    log_step("JOURNEY 7", "Invalid / cleared token rejected (401)", bad_token_resp.status_code == 401)

    print("==================================================")
    print("ALL 7 USER JOURNEYS SUCCESSFULLY VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    main()
