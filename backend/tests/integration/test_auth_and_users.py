from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    # 1. Register
    reg_payload = {
        "email": "alex.mercer@university.edu",
        "password": "SecurePassword123!",
        "full_name": "Alex Mercer",
        "timezone": "America/New_York",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["user"]["email"] == "alex.mercer@university.edu"
    assert "tokens" in reg_data
    token = reg_data["tokens"]["access_token"]
    assert token is not None

    # 2. Duplicate registration fails
    dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 409
    assert dup_res.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"

    # 3. Login success
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "alex.mercer@university.edu", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Login wrong password fails
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "alex.mercer@university.edu", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401
    assert bad_login.json()["error"]["code"] == "INVALID_CREDENTIALS"

    # 5. Access /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Alex Mercer"

    # 6. Unauthorized access without token
    unauth_res = await client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401


@pytest.mark.asyncio
async def test_user_preferences_and_interests_isolation(client: AsyncClient):
    # Register User A
    res_a = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user_a@university.edu",
            "password": "Password123!",
            "full_name": "User A",
        },
    )
    token_a = res_a.json()["tokens"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    res_b = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user_b@university.edu",
            "password": "Password123!",
            "full_name": "User B",
        },
    )
    token_b = res_b.json()["tokens"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A gets default preferences
    pref_res = await client.get("/api/v1/users/me/preferences", headers=headers_a)
    assert pref_res.status_code == 200
    assert pref_res.json()["daily_focus_capacity_hours"] == 4.0

    # User A updates preferences
    patch_res = await client.patch(
        "/api/v1/users/me/preferences",
        json={"daily_focus_capacity_hours": 6.0, "buffer_percentage": 25.0},
        headers=headers_a,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["daily_focus_capacity_hours"] == 6.0
    assert patch_res.json()["buffer_percentage"] == 25.0

    # User B's preferences remain unaffected
    pref_b = await client.get("/api/v1/users/me/preferences", headers=headers_b)
    assert pref_b.json()["daily_focus_capacity_hours"] == 4.0

    # User A creates protected interest
    int_res = await client.post(
        "/api/v1/users/me/interests",
        json={
            "name": "Strength Training",
            "category": "fitness",
            "target_weekly_hours": 5.0,
            "is_protected": True,
            "color_hex": "#E07A5F",
        },
        headers=headers_a,
    )
    assert int_res.status_code == 201
    interest_id = int_res.json()["id"]

    # User A lists interests
    list_a = await client.get("/api/v1/users/me/interests", headers=headers_a)
    assert len(list_a.json()["interests"]) == 1

    # User B lists interests (should be empty, strict isolation)
    list_b = await client.get("/api/v1/users/me/interests", headers=headers_b)
    assert len(list_b.json()["interests"]) == 0

    # User B attempts to delete User A's interest -> should return 404
    del_b = await client.delete(f"/api/v1/users/me/interests/{interest_id}", headers=headers_b)
    assert del_b.status_code == 404

    # User A successfully deletes own interest
    del_a = await client.delete(f"/api/v1/users/me/interests/{interest_id}", headers=headers_a)
    assert del_a.status_code == 204
