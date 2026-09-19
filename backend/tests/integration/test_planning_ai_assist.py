from __future__ import annotations

from datetime import date
import pytest
from httpx import AsyncClient


@pytest.fixture
async def planner_user_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "planner_assistant_user@university.edu",
            "password": "Password123!",
            "full_name": "Planner User",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_planning_assist_unauthorized(client: AsyncClient):
    res = await client.post(
        "/api/v1/ai/plan-assist",
        json={
            "date": "2026-09-21",
            "available_capacity_hours": 4.0,
            "allocated_hours": 3.5,
        },
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_planning_assist_balanced_workload(client: AsyncClient, planner_user_headers: dict):
    res = await client.post(
        "/api/v1/ai/plan-assist",
        json={
            "date": "2026-09-21",
            "available_capacity_hours": 5.0,
            "allocated_hours": 4.0,
            "top_items": [
                {"title": "Operating Systems Lab Report", "duration_minutes": 120},
                {"title": "Algorithms Problem Set", "duration_minutes": 90},
            ],
            "conflicts": [],
        },
        headers=planner_user_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["schedule_pressure"] == "balanced"
    assert data["is_validated_deterministic"] is True
    assert len(data["suggested_adjustments"]) >= 1
    assert len(data["sequencing_recommendations"]) == 2
    assert "Operating Systems" in data["sequencing_recommendations"][0]


@pytest.mark.asyncio
async def test_planning_assist_overloaded_workload(client: AsyncClient, planner_user_headers: dict):
    res = await client.post(
        "/api/v1/ai/plan-assist",
        json={
            "date": "2026-09-21",
            "available_capacity_hours": 3.0,
            "allocated_hours": 6.5,
            "top_items": [
                {"title": "Thesis Chapter 1 Draft", "duration_minutes": 180},
                {"title": "Bug Triage Meeting Prep", "duration_minutes": 90},
            ],
            "conflicts": ["Overallocated by 3.5 hours"],
        },
        headers=planner_user_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["schedule_pressure"] == "overloaded"
    assert "over-allocated" in data["advice"].lower()
    assert "tradeoff" in data["tradeoffs_summary"].lower()
    assert any("postpone" in adj.lower() or "defer" in adj.lower() for adj in data["suggested_adjustments"])


@pytest.mark.asyncio
async def test_plan_ai_assist_from_deterministic_plan(client: AsyncClient, planner_user_headers: dict):
    today_str = date.today().isoformat()

    # Call the integrated planning assist endpoint
    res = await client.get(
        f"/api/v1/planning/{today_str}/ai-assist",
        headers=planner_user_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["schedule_pressure"] in ["relaxed", "balanced", "overloaded"]
    assert data["is_validated_deterministic"] is True
    assert len(data["advice"]) > 0
