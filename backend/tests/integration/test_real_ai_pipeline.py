from __future__ import annotations

import json
from unittest.mock import patch
import httpx
import pytest
from httpx import AsyncClient, Response

from app.api.deps import get_ai_service
from app.main import app
from app.services.ai.ai_service import AIService
from app.services.ai.provider import GeminiProvider


@pytest.fixture
async def auth_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "effort_user@test.org",
            "password": "Password123!",
            "full_name": "Effort Tester",
        },
    )
    assert res.status_code == 201
    return res.json()["tokens"]["access_token"]


def selective_patch_gemini(target_resp_or_exc):
    orig_post = httpx.AsyncClient.post

    async def mock_post(self, *args, **kwargs):
        url = str(args[0]) if args else kwargs.get("url", "")
        if "googleapis.com" in str(url):
            if isinstance(target_resp_or_exc, Exception):
                raise target_resp_or_exc
            return target_resp_or_exc
        return await orig_post(self, *args, **kwargs)

    return patch.object(httpx.AsyncClient, "post", new=mock_post)


@pytest.mark.asyncio
async def test_pipeline_valid_effort_estimate_real_gemini(client: AsyncClient, auth_token: str):
    """
    Test 1: Valid request with Gemini provider.
    Mocks the Gemini API endpoint to return structured JSON, verifies real parsing,
    validation, deterministic pace factor calculation, and response generation.
    """
    gemini_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps({
                                "baseline_estimated_hours": 4.5,
                                "confidence_score": 0.82,
                                "confidence_level": "high",
                                "major_factors": [
                                    "Dataset preprocessing and tokenization",
                                    "Model training hyperparameter search",
                                    "Evaluation metric compilation and error analysis",
                                ],
                                "estimation_rationale": "Machine Learning assignment with model training typically requires 4-5 hours of focused compute and analysis.",
                                "complexity_rating": "complex",
                            })
                        }
                    ]
                }
            }
        ]
    }

    mock_resp = Response(200, json=gemini_payload)
    provider = GeminiProvider(api_key="test_secret_key_mock")
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        with selective_patch_gemini(mock_resp):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "title": "Machine Learning assignment involving model training and evaluation",
                    "category": "project",
                    "complexity": "complex",
                    "description": "Train and evaluate a CNN model on MNIST with data augmentation.",
                },
            )

        assert res.status_code == 200
        data = res.json()
        assert data["baseline_estimated_hours"] == 4.5
        assert data["adjusted_estimated_hours"] == 4.5
        assert data["confidence_score"] == 0.82
        assert data["confidence_level"] == "high"
        assert data["estimation_source"] == "google_gemini_calibrated"
        assert "Google-gemini-1.5-flash-v1.0" in data["model_metadata"]
        assert len(data["major_factors"]) >= 3
        assert any("Dataset preprocessing" in f for f in data["major_factors"])
        assert "–" in data["likely_range"] or "-" in data["likely_range"]
        assert data["is_guarantee"] is False
    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_pipeline_invalid_request_missing_title(client: AsyncClient, auth_token: str):
    """
    Test 2: Invalid request missing title returns HTTP 422.
    """
    res = await client.post(
        "/api/v1/ai/estimate-effort",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "category": "project",
            "complexity": "complex",
        },
    )
    assert res.status_code == 422
    data = res.json()
    assert "detail" in data or "error" in data


@pytest.mark.asyncio
async def test_pipeline_missing_api_key_returns_config_error(client: AsyncClient, auth_token: str):
    """
    Test 3: Missing API key returns controlled HTTP 500 AI_CONFIG_ERROR without leaking secrets.
    """
    provider = GeminiProvider(api_key=None)
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        res = await client.post(
            "/api/v1/ai/estimate-effort",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Write thesis proposal",
                "category": "academic",
            },
        )
        assert res.status_code == 500
        data = res.json()
        assert data["error"]["code"] == "AI_CONFIG_ERROR"
        assert "not configured" in data["error"]["message"].lower()
    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_pipeline_invalid_ai_response_handling(client: AsyncClient, auth_token: str):
    """
    Test 4: Invalid/malformed AI response is caught and returns HTTP 502 AI_MALFORMED_RESPONSE.
    """
    gemini_invalid_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "This is plain text and not JSON format."
                        }
                    ]
                }
            }
        ]
    }
    mock_resp = Response(200, json=gemini_invalid_payload)

    provider = GeminiProvider(api_key="test_key")
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        with selective_patch_gemini(mock_resp):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "title": "Complex Research Analysis",
                    "category": "academic",
                },
            )
        assert res.status_code == 502
        data = res.json()
        assert data["error"]["code"] == "AI_MALFORMED_RESPONSE"
    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_pipeline_provider_rate_limit_and_service_failures(client: AsyncClient, auth_token: str):
    """
    Test 5: Provider failures (429 Rate Limit, 503 Service Unavailable, Timeout).
    """
    provider = GeminiProvider(api_key="test_key")
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        # 1. Test Rate Limit (429)
        mock_429 = Response(429, text="Resource has been exhausted (e.g. check quota).")
        with selective_patch_gemini(mock_429):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"title": "Task under heavy rate limiting"},
            )
        assert res.status_code == 429
        assert res.json()["error"]["code"] == "AI_RATE_LIMIT"

        # 2. Test Service Unavailable (503)
        mock_503 = Response(503, text="Service temporarily unavailable.")
        with selective_patch_gemini(mock_503):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"title": "Task when upstream down"},
            )
        assert res.status_code == 503
        assert res.json()["error"]["code"] == "AI_SERVICE_UNAVAILABLE"

        # 3. Test Timeout (504)
        with selective_patch_gemini(httpx.TimeoutException("Read timeout")):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"title": "Task that hangs upstream"},
            )
        assert res.status_code == 504
        assert res.json()["error"]["code"] == "AI_TIMEOUT"

    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_pipeline_unauthenticated_effort_request(client: AsyncClient):
    """
    Test that unauthenticated requests to AI endpoints are rejected with HTTP 401.
    """
    res = await client.post(
        "/api/v1/ai/estimate-effort",
        json={"title": "Unauthenticated effort test"},
    )
    assert res.status_code == 401
    assert res.json()["error"]["code"] in ("MISSING_TOKEN", "UNAUTHORIZED")
