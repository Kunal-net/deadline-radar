import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "ai_researcher@university.edu",
            "password": "Password123!",
            "full_name": "AI Researcher",
        },
    )
    token = res.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_ai_interpret_endpoint_unauthorized(client: AsyncClient):
    response = await client.post(
        "/api/v1/ai/interpret",
        json={"text": "Finish my research paper by Friday with 5 hours of work"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_ai_interpret_endpoint_validation(client: AsyncClient, auth_headers: dict):
    # Too short text (< 3 characters)
    response = await client.post(
        "/api/v1/ai/interpret",
        json={"text": "hi"},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_interpret_endpoint_success(client: AsyncClient, auth_headers: dict):
    prompt_text = "Finish my ML assignment by Friday. It should take around 4 hours and I need to submit the report."
    response = await client.post(
        "/api/v1/ai/interpret",
        json={"text": prompt_text},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "assignment" in data["title"].lower() or "ml" in data["title"].lower()
    assert data["estimated_hours"] == 4.0
    assert data["deliverable"] == "Written Report"
    assert data["deadline_utc"] is not None
    assert len(data["suggested_subtasks"]) >= 2
    assert data["confidence_score"] >= 0.8
    assert isinstance(data["missing_information"], list)


@pytest.mark.asyncio
async def test_ai_interpret_ambiguous_input(client: AsyncClient, auth_headers: dict):
    ambiguous_text = "Work on stuff"
    response = await client.post(
        "/api/v1/ai/interpret",
        json={"text": ambiguous_text},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] is not None
    # Missing information should flag lack of explicit deadline and effort
    assert len(data["missing_information"]) > 0
    assert any("deadline" in m.lower() for m in data["missing_information"])
    assert data["confidence_score"] < 0.9


@pytest.mark.asyncio
async def test_ai_interpretation_to_work_creation_flow(
    client: AsyncClient, auth_headers: dict
):
    # Step 1: User enters raw text note
    raw_note = "Prepare CS401 midterm notes. Takes about 3 hours by Monday."
    interp_res = await client.post(
        "/api/v1/ai/interpret",
        json={"text": raw_note},
        headers=auth_headers,
    )
    assert interp_res.status_code == 200
    candidate = interp_res.json()

    # Step 2: User confirms and submits as new WorkItem
    work_payload = {
        "title": candidate["title"],
        "description": candidate["description"],
        "category": candidate["category"],
        "deadline_utc": candidate["deadline_utc"],
        "is_hard_deadline": candidate["is_hard_deadline"],
        "estimated_effort_hours": candidate["estimated_hours"],
        "initial_units": [
            {
                "sequence_order": sub["sequence_order"],
                "title": sub["title"],
                "estimated_minutes": int(sub["estimated_hours"] * 60),
            }
            for sub in candidate["suggested_subtasks"]
        ],
    }

    create_res = await client.post(
        "/api/v1/work",
        json=work_payload,
        headers=auth_headers,
    )
    assert create_res.status_code == 201
    created_work = create_res.json()
    assert created_work["title"] == candidate["title"]
    assert len(created_work["units"]) == len(candidate["suggested_subtasks"])


@pytest.mark.asyncio
async def test_ai_decomposition_endpoints_and_confirmation_flow(
    client: AsyncClient, auth_headers: dict
):
    # 1. Standalone Decomposition
    dec_res = await client.post(
        "/api/v1/ai/decompose",
        json={
            "title": "Build Distributed Consensus Engine",
            "category": "project",
            "estimated_hours": 8.0,
        },
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    dec_data = dec_res.json()
    assert len(dec_data["suggested_units"]) >= 3
    assert dec_data["total_estimated_hours"] > 0
    assert dec_data["confidence_score"] >= 0.8
    assert any(len(u.get("dependencies", [])) > 0 for u in dec_data["suggested_units"][1:])

    # 2. Create an undecomposed WorkItem
    work_res = await client.post(
        "/api/v1/work",
        json={
            "title": "Quarterly Performance Review Report",
            "category": "career",
            "estimated_effort_hours": 6.0,
            "deadline_utc": "2026-09-30T18:00:00Z",
        },
        headers=auth_headers,
    )
    assert work_res.status_code == 201
    work_item = work_res.json()
    work_id = work_item["id"]
    assert len(work_item.get("units") or []) == 0

    # 3. Decompose the existing WorkItem
    item_dec_res = await client.post(
        f"/api/v1/ai/work/{work_id}/decompose",
        headers=auth_headers,
    )
    assert item_dec_res.status_code == 200
    item_dec = item_dec_res.json()
    assert len(item_dec["suggested_units"]) >= 2

    # 4. User confirms and applies decomposition
    apply_res = await client.post(
        f"/api/v1/ai/work/{work_id}/apply-decomposition",
        json={"units": item_dec["suggested_units"]},
        headers=auth_headers,
    )
    assert apply_res.status_code == 200
    updated_item = apply_res.json()
    assert len(updated_item["units"]) == len(item_dec["suggested_units"])
    assert updated_item["remaining_estimated_hours"] > 0

