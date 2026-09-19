from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.fixture
async def dashboard_auth_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "radar_lead@university.edu",
            "password": "Password123!",
            "full_name": "Radar Lead",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_frontend_contract_field_parity(
    client: AsyncClient,
    dashboard_auth_headers: dict,
):
    deadline = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    create_payload = {
        "title": "Machine Learning Lab 4",
        "description": "Evaluate ResNet on CIFAR-100",
        "category": "academic",
        "deadline_utc": deadline,
        "is_hard_deadline": True,
        "importance_weight": 1.5,
        "initial_units": [
            {"title": "Setup PyTorch DataLoader", "estimated_hours": 1.5},
            {"title": "Training & Validation Sweep", "estimated_hours": 3.0},
        ],
    }
    create_res = await client.post("/api/v1/work", json=create_payload, headers=dashboard_auth_headers)
    assert create_res.status_code == 201
    data = create_res.json()

    # Verify snake_case backend fields
    assert "remaining_estimated_hours" in data
    assert "total_estimated_hours" in data
    assert "total_actual_hours" in data
    assert "dynamic_priority" in data
    assert "risk_state" in data

    # Verify camelCase frontend parity computed fields
    assert "remainingEffortHours" in data
    assert data["remainingEffortHours"] == 4.5
    assert "estimatedEffortHours" in data
    assert data["estimatedEffortHours"] == 4.5
    assert "actualLoggedHours" in data
    assert data["actualLoggedHours"] == 0.0
    assert "dynamicPriorityScore" in data
    assert "riskLevel" in data
    assert data["riskLevel"] in ("SAFE", "WATCH", "AT_RISK", "CRITICAL", "OVERDUE")
    assert "deadlineUtc" in data
    assert "isHardDeadline" in data

    # Verify units list
    work_id = data["id"]
    units_res = await client.get(f"/api/v1/work/{work_id}/units", headers=dashboard_auth_headers)
    assert units_res.status_code == 200
    units_data = units_res.json()
    assert len(units_data["units"]) == 2

    unit0 = units_data["units"][0]
    assert unit0["workItemId"] == work_id
    assert unit0["isCompleted"] is False
    assert unit0["estimatedMinutes"] == 90
    assert unit0["completedMinutes"] == 0
    assert unit0["orderIndex"] == 1


@pytest.mark.asyncio
async def test_dashboard_summary_operational_radar(
    client: AsyncClient,
    dashboard_auth_headers: dict,
):
    # Create urgent work item due tomorrow
    urgent_deadline = (datetime.now(timezone.utc) + timedelta(hours=6)).isoformat()
    await client.post(
        "/api/v1/work",
        json={
            "title": "Operating Systems Memory Allocator",
            "category": "academic",
            "deadline_utc": urgent_deadline,
            "is_hard_deadline": True,
            "importance_weight": 2.0,
            "initial_units": [
                {"title": "Implement buddy allocator", "estimated_hours": 4.0},
            ],
        },
        headers=dashboard_auth_headers,
    )

    res = await client.get("/api/v1/dashboard/summary", headers=dashboard_auth_headers)
    assert res.status_code == 200
    summary = res.json()

    assert "risk_counts" in summary
    assert "critical_items" in summary
    assert "week_workload_hours" in summary
    assert "week_capacity_hours" in summary
    assert "capacity_status" in summary
    assert "capacity_metric" in summary

    # Verify camelCase aliases
    assert "riskCounts" in summary
    assert "criticalItems" in summary
    assert "weekWorkloadHours" in summary
    assert "weekCapacityHours" in summary
    assert "capacityStatus" in summary
    assert "capacityMetric" in summary

    assert summary["weekWorkloadHours"] >= 4.0
    assert summary["capacityStatus"] in ("safe", "balanced", "tight", "overloaded")
    assert summary["capacityMetric"]["weekNumber"] > 0
    assert summary["capacityMetric"]["availableFocusHours"] > 0


@pytest.mark.asyncio
async def test_timeline_projection_horizon(
    client: AsyncClient,
    dashboard_auth_headers: dict,
):
    # Create active item to project
    deadline = (datetime.now(timezone.utc) + timedelta(days=4)).isoformat()
    await client.post(
        "/api/v1/work",
        json={
            "title": "Distributed Systems Raft Cluster",
            "category": "academic",
            "deadline_utc": deadline,
            "is_hard_deadline": True,
            "importance_weight": 1.5,
            "initial_units": [
                {"title": "Implement Leader Election", "estimated_hours": 3.0},
            ],
        },
        headers=dashboard_auth_headers,
    )

    res = await client.get("/api/v1/timeline/projection?days=7", headers=dashboard_auth_headers)
    assert res.status_code == 200
    projection = res.json()

    assert "timeline_window" in projection
    assert "timelineWindow" in projection
    assert "items" in projection
    assert len(projection["items"]) >= 1

    item0 = projection["items"][0]
    assert "workItemId" in item0
    assert "remainingEstimatedHours" in item0
    assert "allocatedSlots" in item0
    assert isinstance(item0["allocatedSlots"], list)


@pytest.mark.asyncio
async def test_workload_capacity_breakdown(
    client: AsyncClient,
    dashboard_auth_headers: dict,
):
    res = await client.get("/api/v1/workload/capacity?view=day", headers=dashboard_auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert "periods" in data
    assert len(data["periods"]) >= 7

    period0 = data["periods"][0]
    assert "dateLabel" in period0
    assert "dayOfWeek" in period0
    assert "capacityHours" in period0
    assert "demandHours" in period0
    assert "utilizationPercentage" in period0
    assert "isOverloaded" in period0
    assert period0["capacityHours"] > 0.0
