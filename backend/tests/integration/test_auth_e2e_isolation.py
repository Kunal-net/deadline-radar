from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_registration_flow_and_validation(client: AsyncClient):
    # 1. Valid registration succeeds
    valid_payload = {
        "email": "dr.alan.grant@paleo.edu",
        "password": "SuperSecretPass123!",
        "full_name": "Dr. Alan Grant",
        "timezone": "America/Denver",
    }
    reg_res = await client.post("/api/v1/auth/register", json=valid_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["user"]["email"] == "dr.alan.grant@paleo.edu"
    assert data["user"]["full_name"] == "Dr. Alan Grant"
    assert data["user"]["timezone"] == "America/Denver"
    assert "id" in data["user"]
    assert "tokens" in data
    assert "access_token" in data["tokens"]
    assert data["tokens"]["token_type"] == "bearer"
    assert data["tokens"]["expires_in"] == 1800

    # 2. Duplicate registration rejected
    dup_res = await client.post("/api/v1/auth/register", json=valid_payload)
    assert dup_res.status_code == 409
    assert dup_res.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"

    # 3. Validation: Password too short (<8 characters)
    short_pw_payload = {
        "email": "short@paleo.edu",
        "password": "short",
        "full_name": "Short Pw",
    }
    short_res = await client.post("/api/v1/auth/register", json=short_pw_payload)
    assert short_res.status_code == 422

    # 4. Validation: Invalid email format
    bad_email_payload = {
        "email": "not-an-email",
        "password": "ValidPassword123!",
        "full_name": "Bad Email",
    }
    bad_email_res = await client.post("/api/v1/auth/register", json=bad_email_payload)
    assert bad_email_res.status_code == 422


@pytest.mark.asyncio
async def test_login_flow_and_failures(client: AsyncClient, db_session: AsyncSession):
    # Register user
    reg_payload = {
        "email": "ellie.sattler@paleo.edu",
        "password": "BotanistPassword123!",
        "full_name": "Dr. Ellie Sattler",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # 1. Valid login succeeds
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "ellie.sattler@paleo.edu", "password": "BotanistPassword123!"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"
    assert login_data["expires_in"] == 1800

    # 2. Invalid password rejected
    bad_pw_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "ellie.sattler@paleo.edu", "password": "IncorrectPassword!"},
    )
    assert bad_pw_res.status_code == 401
    assert bad_pw_res.json()["error"]["code"] == "INVALID_CREDENTIALS"

    # 3. Nonexistent user rejected
    no_user_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@paleo.edu", "password": "AnyPassword123!"},
    )
    assert no_user_res.status_code == 401
    assert no_user_res.json()["error"]["code"] == "INVALID_CREDENTIALS"

    # 4. Deactivated user login rejected
    from sqlalchemy import update
    await db_session.execute(
        update(User)
        .where(User.email == "ellie.sattler@paleo.edu")
        .values(is_active=False)
    )
    await db_session.commit()

    deact_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "ellie.sattler@paleo.edu", "password": "BotanistPassword123!"},
    )
    assert deact_res.status_code == 401
    assert deact_res.json()["error"]["code"] == "ACCOUNT_DEACTIVATED"


@pytest.mark.asyncio
async def test_protected_endpoints_token_validation(client: AsyncClient):
    # 1. Missing Authorization header -> 401 MISSING_TOKEN
    no_token_me = await client.get("/api/v1/auth/me")
    assert no_token_me.status_code == 401
    assert no_token_me.json()["error"]["code"] == "MISSING_TOKEN"

    no_token_work = await client.get("/api/v1/work")
    assert no_token_work.status_code == 401
    assert no_token_work.json()["error"]["code"] == "MISSING_TOKEN"

    no_token_today = await client.get("/api/v1/today/overview")
    assert no_token_today.status_code == 401
    assert no_token_today.json()["error"]["code"] == "MISSING_TOKEN"

    # 2. Malformed / garbage header format -> 401 INVALID_HEADER
    bad_header = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "NotBearerToken123"},
    )
    assert bad_header.status_code == 401
    assert bad_header.json()["error"]["code"] == "INVALID_HEADER"

    # 3. Malformed / invalid token payload -> 401 INVALID_TOKEN
    bad_token = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not.a.valid.jwt.signature"},
    )
    assert bad_token.status_code == 401
    assert bad_token.json()["error"]["code"] == "INVALID_TOKEN"

    # 4. Expired token -> 401 EXPIRED_TOKEN
    expired_jwt = create_access_token(
        {"sub": "usr_expired_test", "email": "expired@test.com"},
        expires_delta=timedelta(seconds=-60),
    )
    expired_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_jwt}"},
    )
    assert expired_res.status_code == 401
    assert expired_res.json()["error"]["code"] == "EXPIRED_TOKEN"

    # 5. Token for non-existent user in DB -> 401 USER_NOT_FOUND
    ghost_jwt = create_access_token(
        {"sub": "usr_nonexistent_in_db_9999", "email": "ghost@test.com"},
    )
    ghost_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {ghost_jwt}"},
    )
    assert ghost_res.status_code == 401
    assert ghost_res.json()["error"]["code"] == "USER_NOT_FOUND"


@pytest.mark.asyncio
async def test_current_user_me_endpoint(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "ian.malcolm@chaos.edu",
            "password": "ComplexityTheory123!",
            "full_name": "Dr. Ian Malcolm",
            "timezone": "America/Chicago",
        },
    )
    token = reg.json()["tokens"]["access_token"]
    user_id = reg.json()["user"]["id"]

    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["id"] == user_id
    assert me_data["email"] == "ian.malcolm@chaos.edu"
    assert me_data["full_name"] == "Dr. Ian Malcolm"
    assert me_data["timezone"] == "America/Chicago"


@pytest.mark.asyncio
async def test_complete_user_data_isolation_e2e(client: AsyncClient):
    """
    CRITICAL SECURITY CONTRACT:
    User A's data (work items, units, dashboard summary, today plan, availability blocks,
    protected interests, active sessions) must NEVER be accessible or visible to User B.
    """
    # 1. Register and login User A
    res_a = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user.alpha@enterprise.org",
            "password": "AlphaPassword123!",
            "full_name": "User Alpha",
            "timezone": "UTC",
        },
    )
    token_a = res_a.json()["tokens"]["access_token"]
    user_a_id = res_a.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register and login User B
    res_b = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user.beta@enterprise.org",
            "password": "BetaPassword123!",
            "full_name": "User Beta",
            "timezone": "UTC",
        },
    )
    token_b = res_b.json()["tokens"]["access_token"]
    user_b_id = res_b.json()["user"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    assert user_a_id != user_b_id

    # 3. User A creates Work Item with Units
    work_a_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Alpha Confidential Research Report",
            "description": "Proprietary research methodology and findings.",
            "category": "academic",
            "importance_weight": 2.0,
            "deadline_utc": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
            "is_hard_deadline": True,
            "estimated_hours": 12.0,
            "initial_units": [
                {"title": "Section 1: Literature Review", "estimated_hours": 4.0},
                {"title": "Section 2: Empirical Analysis", "estimated_hours": 8.0},
            ],
        },
        headers=headers_a,
    )
    assert work_a_res.status_code == 201
    work_a_data = work_a_res.json()
    work_a_id = work_a_data["id"]
    unit_a_id = work_a_data["units"][0]["id"]

    # 4. User A creates Availability Schedule Block
    block_a_res = await client.post(
        "/api/v1/availability/blocks",
        json={
            "title": "Alpha Private Board Meeting",
            "block_type": "hard_commitment",
            "start_time": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "end_time": (datetime.now(timezone.utc) + timedelta(days=1, hours=2)).isoformat(),
            "is_blackout": True,
            "notes": "Strictly confidential board session",
        },
        headers=headers_a,
    )
    assert block_a_res.status_code == 201
    block_a_id = block_a_res.json()["id"]

    # 5. User A creates Personal Protected Interest
    int_a_res = await client.post(
        "/api/v1/users/me/interests",
        json={
            "name": "Alpha Violin Rehearsal",
            "category": "music",
            "target_weekly_hours": 6.0,
            "is_protected": True,
            "color_hex": "#1E3A8A",
        },
        headers=headers_a,
    )
    assert int_a_res.status_code == 201
    int_a_id = int_a_res.json()["id"]

    # 6. User A starts an active tracking session
    session_a_res = await client.post(
        "/api/v1/tracking/sessions/start",
        json={"work_item_id": work_a_id, "work_unit_id": unit_a_id},
        headers=headers_a,
    )
    assert session_a_res.status_code == 201

    # 7. User A generates Daily Plan
    plan_a_res = await client.post(
        "/api/v1/planning/generate",
        json={"target_date": datetime.now(timezone.utc).date().isoformat()},
        headers=headers_a,
    )
    assert plan_a_res.status_code == 200

    # ============================================================
    # VERIFY USER B SEES ZERO OF USER A'S DATA
    # ============================================================

    # Work items list for User B must be empty
    list_b = await client.get("/api/v1/work", headers=headers_b)
    assert list_b.status_code == 200
    assert list_b.json()["total"] == 0
    assert len(list_b.json()["items"]) == 0

    # User B cannot access User A's work item by ID -> 404 NOT_FOUND
    get_b_item = await client.get(f"/api/v1/work/{work_a_id}", headers=headers_b)
    assert get_b_item.status_code == 404

    # User B cannot list User A's work units -> 404 NOT_FOUND
    get_b_units = await client.get(f"/api/v1/work/{work_a_id}/units", headers=headers_b)
    assert get_b_units.status_code == 404

    # User B cannot update User A's work item -> 404 NOT_FOUND
    patch_b_item = await client.patch(
        f"/api/v1/work/{work_a_id}",
        json={"title": "Hacked Title"},
        headers=headers_b,
    )
    assert patch_b_item.status_code == 404

    # User B cannot delete User A's work item -> 404 NOT_FOUND
    del_b_item = await client.delete(f"/api/v1/work/{work_a_id}", headers=headers_b)
    assert del_b_item.status_code == 404

    # User B cannot add unit to User A's work item -> 404 NOT_FOUND
    add_b_unit = await client.post(
        f"/api/v1/work/{work_a_id}/units",
        json={"title": "Hacked Unit", "estimated_hours": 1.0},
        headers=headers_b,
    )
    assert add_b_unit.status_code == 404

    # User B dashboard summary must show 0 work items and 0 workload
    dash_b = await client.get("/api/v1/dashboard/summary", headers=headers_b)
    assert dash_b.status_code == 200
    dash_b_data = dash_b.json()
    assert len(dash_b_data["critical_items"]) == 0
    assert dash_b_data["risk_counts"]["safe"] == 0
    assert dash_b_data["risk_counts"]["watch"] == 0
    assert dash_b_data["risk_counts"]["at_risk"] == 0
    assert dash_b_data["risk_counts"]["critical"] == 0
    assert dash_b_data["week_workload_hours"] == 0.0

    # User B Today Overview must have NO active session and NO items from User A
    today_b = await client.get("/api/v1/today/overview", headers=headers_b)
    assert today_b.status_code == 200
    today_b_data = today_b.json()
    assert today_b_data["active_session"] is None
    assert len(today_b_data["today_plan_items"]) == 0
    assert today_b_data["now_recommendation"] is None

    # User B Availability blocks must NOT contain User A's block
    blocks_b = await client.get("/api/v1/availability/blocks", headers=headers_b)
    assert blocks_b.status_code == 200
    assert len(blocks_b.json()["blocks"]) == 0

    # User B cannot delete User A's schedule block -> 404 NOT_FOUND
    del_b_block = await client.delete(f"/api/v1/availability/blocks/{block_a_id}", headers=headers_b)
    assert del_b_block.status_code == 404

    # User B Interests must NOT contain User A's interest
    int_b = await client.get("/api/v1/users/me/interests", headers=headers_b)
    assert int_b.status_code == 200
    assert len(int_b.json()["interests"]) == 0

    # User B cannot delete User A's interest -> 404 NOT_FOUND
    del_b_int = await client.delete(f"/api/v1/users/me/interests/{int_a_id}", headers=headers_b)
    assert del_b_int.status_code == 404

    # User B Active session check returns None
    active_b = await client.get("/api/v1/tracking/sessions/active", headers=headers_b)
    assert active_b.status_code == 200
    assert active_b.json() is None
