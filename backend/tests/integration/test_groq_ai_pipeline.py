"""
Integration tests for the complete Groq AI provider pipeline.

Covers:
  - Provider factory selection: AI_PROVIDER=groq → GroqProvider
  - Missing API key: AIConfigurationException (HTTP 500, AI_CONFIG_ERROR)
  - Valid mocked Groq response: HTTP 200, groq_calibrated source, deterministic calculations
  - Malformed AI response: HTTP 502, AI_MALFORMED_RESPONSE
  - Rate limit (429): HTTP 429, AI_RATE_LIMIT
  - Service unavailable (503): HTTP 503, AI_SERVICE_UNAVAILABLE
  - Timeout: HTTP 504, AI_TIMEOUT
  - Missing request title: HTTP 422
  - Unauthenticated request: HTTP 401

No real API key is used in any test.
All Groq HTTP traffic is intercepted via selective mock on httpx.AsyncClient.post.
"""
from __future__ import annotations

import json
from unittest.mock import patch
import httpx
import pytest
from httpx import AsyncClient, Response

from app.api.deps import get_ai_service
from app.main import app
from app.services.ai.ai_service import AIService
from app.services.ai.provider import GroqProvider, GeminiProvider, MockAIProvider, get_ai_provider
from app.core.config import settings


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

@pytest.fixture
async def auth_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "groq_effort_user@test.org",
            "password": "Password123!",
            "full_name": "Groq Effort Tester",
        },
    )
    assert res.status_code == 201
    return res.json()["tokens"]["access_token"]


def selective_patch_groq(target_resp_or_exc):
    """Intercept only requests to api.groq.com; let all other HTTP pass through."""
    orig_post = httpx.AsyncClient.post

    async def mock_post(self, *args, **kwargs):
        url = str(args[0]) if args else str(kwargs.get("url", ""))
        if "api.groq.com" in url:
            if isinstance(target_resp_or_exc, Exception):
                raise target_resp_or_exc
            return target_resp_or_exc
        return await orig_post(self, *args, **kwargs)

    return patch.object(httpx.AsyncClient, "post", new=mock_post)


def make_groq_response(content_dict: dict) -> Response:
    """Build a mock Groq API response in the OpenAI-compatible format."""
    return Response(
        200,
        json={
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": json.dumps(content_dict),
                    }
                }
            ],
            "model": "llama-3.3-70b-versatile",
        },
    )


# ---------------------------------------------------------------------------
# Provider Factory Tests
# ---------------------------------------------------------------------------

class TestProviderFactory:
    """Verify that get_ai_provider() returns the correct provider type."""

    def test_factory_selects_groq_when_ai_provider_is_groq(self, monkeypatch):
        monkeypatch.setattr(settings, "AI_PROVIDER", "groq")
        monkeypatch.setattr(settings, "GROQ_API_KEY", "test_key")
        provider = get_ai_provider()
        assert isinstance(provider, GroqProvider), f"Expected GroqProvider, got {type(provider)}"

    def test_factory_selects_gemini_when_ai_provider_is_gemini(self, monkeypatch):
        monkeypatch.setattr(settings, "AI_PROVIDER", "gemini")
        provider = get_ai_provider()
        assert isinstance(provider, GeminiProvider)

    def test_factory_selects_mock_when_ai_provider_is_mock(self, monkeypatch):
        monkeypatch.setattr(settings, "AI_PROVIDER", "mock")
        provider = get_ai_provider()
        assert isinstance(provider, MockAIProvider)

    def test_factory_auto_detects_groq_from_key(self, monkeypatch):
        monkeypatch.setattr(settings, "AI_PROVIDER", "")
        monkeypatch.setattr(settings, "GROQ_API_KEY", "auto_detect_key")
        provider = get_ai_provider()
        assert isinstance(provider, GroqProvider)

    def test_factory_falls_back_to_mock_without_any_key(self, monkeypatch):
        monkeypatch.setattr(settings, "AI_PROVIDER", "")
        monkeypatch.setattr(settings, "GROQ_API_KEY", None)
        monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
        monkeypatch.setattr(settings, "GOOGLE_API_KEY", None)
        provider = get_ai_provider()
        assert isinstance(provider, MockAIProvider)


# ---------------------------------------------------------------------------
# Integration Tests: POST /api/v1/ai/estimate-effort via GroqProvider
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_groq_pipeline_valid_effort_estimate(client: AsyncClient, auth_token: str):
    """
    Test 1: Valid request with mocked Groq response.
    Verifies full pipeline: request → GroqProvider → mocked HTTP → parsing →
    Pydantic validation → deterministic calculations → HTTP 200 response.
    """
    groq_model_output = {
        "baseline_estimated_hours": 4.5,
        "confidence_score": 0.82,
        "confidence_level": "high",
        "major_factors": [
            "Dataset preprocessing and tokenization complexity",
            "Model training hyperparameter search space",
            "Evaluation metric compilation and error analysis",
        ],
        "estimation_rationale": (
            "Machine Learning assignment with model training typically requires "
            "4-5 hours of focused compute and analysis work."
        ),
        "complexity_rating": "complex",
    }

    provider = GroqProvider(api_key="test_secret_key_groq")
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        with selective_patch_groq(make_groq_response(groq_model_output)):
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

        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()

        # Verify Groq-specific source attribution
        assert data["estimation_source"] == "groq_calibrated", (
            f"Expected groq_calibrated, got {data['estimation_source']}"
        )
        assert "Groq-" in data["model_metadata"], (
            f"Expected Groq- prefix in model_metadata, got {data['model_metadata']}"
        )

        # Verify model output is correctly parsed
        assert data["baseline_estimated_hours"] == 4.5
        assert data["confidence_score"] == 0.82
        assert data["confidence_level"] == "high"
        assert len(data["major_factors"]) >= 3
        assert any("Dataset preprocessing" in f for f in data["major_factors"])

        # Verify deterministic calculations applied correctly
        # pace_factor=1.0 (no history) → adjusted = baseline * 1.0 = 4.5
        assert data["adjusted_estimated_hours"] == 4.5
        assert data["min_expected_hours"] == round(4.5 * 0.75, 1)
        assert data["max_expected_hours"] == round(4.5 * 1.35, 1)
        assert "–" in data["likely_range"] or "-" in data["likely_range"]

        # Verify non-guarantee flag
        assert data["is_guarantee"] is False
    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_groq_pipeline_invalid_request_missing_title(client: AsyncClient, auth_token: str):
    """Test 2: Missing title returns HTTP 422 (Pydantic validation)."""
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
async def test_groq_pipeline_missing_api_key_returns_config_error(client: AsyncClient, auth_token: str):
    """
    Test 3: Missing GROQ_API_KEY with AI_PROVIDER=groq returns controlled
    HTTP 500 AI_CONFIG_ERROR. No secret is leaked in the response.
    """
    provider = GroqProvider(api_key=None)
    # Force api_key to None explicitly (bypasses settings fallback)
    provider.api_key = None
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        res = await client.post(
            "/api/v1/ai/estimate-effort",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Write thesis proposal chapter 1",
                "category": "academic",
            },
        )
        assert res.status_code == 500, f"Expected 500, got {res.status_code}: {res.text}"
        data = res.json()
        assert data["error"]["code"] == "AI_CONFIG_ERROR"
        assert "not configured" in data["error"]["message"].lower()
        # Verify no secret is in the response
        assert "Bearer" not in res.text
        assert "gsk_" not in res.text  # Groq key prefix never appears
    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_groq_pipeline_malformed_ai_response(client: AsyncClient, auth_token: str):
    """
    Test 4: Groq returns 200 but with non-JSON content in choices[0].message.content.
    Verify HTTP 502 AI_MALFORMED_RESPONSE.
    """
    bad_response = Response(
        200,
        json={
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "This is plain text and not JSON at all.",
                    }
                }
            ]
        },
    )
    provider = GroqProvider(api_key="test_key")
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        with selective_patch_groq(bad_response):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "title": "Complex research analysis task",
                    "category": "academic",
                },
            )
        assert res.status_code == 502, f"Expected 502, got {res.status_code}: {res.text}"
        data = res.json()
        assert data["error"]["code"] == "AI_MALFORMED_RESPONSE"
    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_groq_pipeline_provider_rate_limit_and_service_failures(
    client: AsyncClient, auth_token: str
):
    """
    Test 5: Provider HTTP failure scenarios:
      - 429 → HTTP 429 AI_RATE_LIMIT
      - 503 → HTTP 503 AI_SERVICE_UNAVAILABLE
      - httpx.TimeoutException → HTTP 504 AI_TIMEOUT
    """
    provider = GroqProvider(api_key="test_key")
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        # 1. Rate Limit
        mock_429 = Response(429, text="rate_limit_exceeded")
        with selective_patch_groq(mock_429):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"title": "Task hitting rate limit"},
            )
        assert res.status_code == 429, f"Expected 429, got {res.status_code}"
        assert res.json()["error"]["code"] == "AI_RATE_LIMIT"

        # 2. Service Unavailable
        mock_503 = Response(503, text="service_temporarily_unavailable")
        with selective_patch_groq(mock_503):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"title": "Task when Groq is down"},
            )
        assert res.status_code == 503, f"Expected 503, got {res.status_code}"
        assert res.json()["error"]["code"] == "AI_SERVICE_UNAVAILABLE"

        # 3. Timeout
        with selective_patch_groq(httpx.TimeoutException("Read timeout")):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"title": "Task that times out on Groq"},
            )
        assert res.status_code == 504, f"Expected 504, got {res.status_code}"
        assert res.json()["error"]["code"] == "AI_TIMEOUT"

    finally:
        app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_groq_pipeline_unauthenticated_request(client: AsyncClient):
    """Test 6: Requests without JWT are rejected with HTTP 401."""
    res = await client.post(
        "/api/v1/ai/estimate-effort",
        json={"title": "Unauthenticated Groq effort test"},
    )
    assert res.status_code == 401
    assert res.json()["error"]["code"] in ("MISSING_TOKEN", "UNAUTHORIZED")


@pytest.mark.asyncio
async def test_groq_pipeline_schema_validation_rejects_negative_hours(
    client: AsyncClient, auth_token: str
):
    """
    Test 7: Groq returns a JSON response where baseline_estimated_hours = -1.0
    (violates gt=0.0 constraint on EffortEstimationModelOutput).
    Verify HTTP 502 AI_MALFORMED_RESPONSE.
    """
    bad_model_output = {
        "baseline_estimated_hours": -1.0,  # Invalid: must be > 0
        "confidence_score": 0.80,
        "confidence_level": "medium",
        "major_factors": ["Factor A"],
        "estimation_rationale": "This should fail validation.",
        "complexity_rating": "moderate",
    }
    provider = GroqProvider(api_key="test_key")
    ai_service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: ai_service

    try:
        with selective_patch_groq(make_groq_response(bad_model_output)):
            res = await client.post(
                "/api/v1/ai/estimate-effort",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"title": "Task with invalid model output", "category": "academic"},
            )
        assert res.status_code == 502, f"Expected 502, got {res.status_code}: {res.text}"
        assert res.json()["error"]["code"] == "AI_MALFORMED_RESPONSE"
    finally:
        app.dependency_overrides.pop(get_ai_service, None)
