from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.fixture
async def user_a_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "explainer_a@university.edu",
            "password": "Password123!",
            "full_name": "Explainer A",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def user_b_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "explainer_b@university.edu",
            "password": "Password123!",
            "full_name": "Explainer B",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_ai_explain_unauthorized(client: AsyncClient):
    res = await client.post(
        "/api/v1/ai/explain",
        json={
            "title": "Compiler Project",
            "risk_state": "critical",
            "risk_ratio": 2.0,
            "dynamic_priority": 95.0,
            "remaining_hours": 8.0,
            "available_hours": 4.0,
        },
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_ai_explain_grounded_critical_risk(client: AsyncClient, user_a_headers: dict):
    res = await client.post(
        "/api/v1/ai/explain",
        json={
            "title": "Distributed Systems Raft Assignment",
            "risk_state": "critical",
            "risk_ratio": 2.2,
            "dynamic_priority": 92.5,
            "remaining_hours": 8.8,
            "available_hours": 4.0,
            "days_until_deadline": 1.5,
            "factors": ["Critical capacity deficit: 8.8h required vs 4.0h capacity."],
        },
        headers=user_a_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "92.5" in data["summary"]
    assert "CRITICAL" in data["summary"]
    assert "8.8" in data["risk_explanation"]
    assert "4.0" in data["risk_explanation"]
    assert data["variance_explanation"] is not None
    assert len(data["actionable_recommendations"]) >= 2
    # Verify numbers are strictly grounded, not fabricated
    grounded = data["grounded_metrics"]
    assert grounded["remaining_hours"] == 8.8
    assert grounded["available_hours"] == 4.0
    assert grounded["risk_ratio"] == 2.2


@pytest.mark.asyncio
async def test_work_item_explanation_endpoints_and_isolation(
    client: AsyncClient, user_a_headers: dict, user_b_headers: dict
):
    now = datetime.now(timezone.utc)
    # 1. User A creates work item
    create_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Quantum Computing Problem Set",
            "category": "academic",
            "estimated_effort_hours": 5.0,
            "deadline_utc": (now + timedelta(days=3)).isoformat(),
        },
        headers=user_a_headers,
    )
    assert create_res.status_code == 201
    item = create_res.json()
    work_id = item["id"]

    # 2. Query explanation via /ai/work/{id}/explanation
    ai_exp_res = await client.get(
        f"/api/v1/ai/work/{work_id}/explanation",
        headers=user_a_headers,
    )
    assert ai_exp_res.status_code == 200
    ai_exp = ai_exp_res.json()
    assert "Quantum Computing" in ai_exp["summary"]
    assert len(ai_exp["actionable_recommendations"]) > 0

    # 3. Query explanation via /work/{id}/explanation
    work_exp_res = await client.get(
        f"/api/v1/work/{work_id}/explanation",
        headers=user_a_headers,
    )
    assert work_exp_res.status_code == 200
    work_exp = work_exp_res.json()
    assert "Quantum Computing" in work_exp["summary"]

    # 4. User B cannot access User A's explanation (Isolation test)
    isolated_res = await client.get(
        f"/api/v1/work/{work_id}/explanation",
        headers=user_b_headers,
    )
    assert isolated_res.status_code == 404
