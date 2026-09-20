import pytest
from app.services.ai import (
    AIService,
    GeminiProvider,
    GroqProvider,
    MockAIProvider,
    get_ai_provider,
)
from app.services.ai.schemas import (
    DecompositionRequest,
    EffortEstimationModelOutput,
    EffortEstimationRequest,
    ExplanationRequest,
    PlanningAssistanceRequest,
    WorkInterpretationRequest,
)
from app.core.config import settings
from app.core.errors import AIConfigurationException


@pytest.mark.asyncio
async def test_ai_provider_factory_and_fallback():
    """Factory returns MockAIProvider by default (no keys configured)."""
    provider = get_ai_provider()
    assert isinstance(provider, MockAIProvider)

    gemini = GeminiProvider(api_key=None)
    # When api_key is None, GeminiProvider must raise controlled AIConfigurationException
    req = WorkInterpretationRequest(text="Finish research paper by Friday taking 4 hours")
    with pytest.raises(AIConfigurationException) as exc_info:
        await gemini.interpret_work(req)
    assert "not configured" in str(exc_info.value)


@pytest.mark.asyncio
async def test_groq_provider_raises_config_error_when_key_missing():
    """GroqProvider with no api_key must raise AIConfigurationException immediately,
    not silently fall back to MockAIProvider."""
    groq = GroqProvider(api_key=None)
    groq.api_key = None  # explicitly ensure it's None, bypassing settings fallback
    req = EffortEstimationRequest(title="Build test project", category="project")
    with pytest.raises(AIConfigurationException) as exc_info:
        await groq.estimate_effort(req)
    assert "not configured" in str(exc_info.value).lower()
    assert "GROQ_API_KEY" in str(exc_info.value)


def test_groq_provider_selected_when_ai_provider_is_groq(monkeypatch):
    """Factory returns GroqProvider when AI_PROVIDER=groq."""
    monkeypatch.setattr(settings, "AI_PROVIDER", "groq")
    monkeypatch.setattr(settings, "GROQ_API_KEY", "fake-key-for-test")
    provider = get_ai_provider()
    assert isinstance(provider, GroqProvider), f"Expected GroqProvider, got {type(provider)}"


def test_effort_estimation_model_output_schema_validation():
    """EffortEstimationModelOutput rejects negative or zero hours."""
    import pytest
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        EffortEstimationModelOutput(
            baseline_estimated_hours=-1.0,
            confidence_score=0.8,
            confidence_level="medium",
            major_factors=["factor"],
            estimation_rationale="test",
        )
    with pytest.raises(ValidationError):
        EffortEstimationModelOutput(
            baseline_estimated_hours=0.0,
            confidence_score=0.8,
            confidence_level="medium",
            major_factors=["factor"],
            estimation_rationale="test",
        )


@pytest.mark.asyncio
async def test_mock_provider_natural_language_interpretation():
    provider = MockAIProvider()
    req = WorkInterpretationRequest(
        text="Study for distributed systems exam next week. Should take about 5 hours and submit practice problems."
    )
    res = await provider.interpret_work(req)
    assert res.category == "exam_prep"
    assert res.estimated_hours == 5.0
    assert res.deadline_utc is not None
    assert len(res.suggested_subtasks) == 3
    assert res.confidence_score > 0.7


@pytest.mark.asyncio
async def test_mock_provider_decomposition():
    provider = MockAIProvider()
    req = DecompositionRequest(
        work_title="Autonomous AI Agent Project",
        category="project",
        estimated_hours=6.0,
    )
    res = await provider.decompose_work(req)
    assert len(res.suggested_units) >= 3
    assert res.total_estimated_hours > 0
    assert res.confidence_score >= 0.8
    # Sequence orders must be 1, 2, 3...
    assert [u.sequence_order for u in res.suggested_units] == list(range(1, len(res.suggested_units) + 1))


@pytest.mark.asyncio
async def test_mock_provider_effort_estimation():
    provider = MockAIProvider()
    req = EffortEstimationRequest(
        title="Machine Learning Final Term Project",
        category="project",
        complexity="complex",
        units_count=4,
    )
    res = await provider.estimate_effort(req)
    assert res.min_expected_hours < res.baseline_hours <= res.max_expected_hours
    assert res.baseline_hours > 0
    assert "Calibrated estimate" in res.estimation_rationale


@pytest.mark.asyncio
async def test_mock_provider_explanation():
    provider = MockAIProvider()
    req = ExplanationRequest(
        title="Operating Systems Lab 3",
        risk_state="critical",
        risk_ratio=1.65,
        dynamic_priority=88.5,
        remaining_hours=5.0,
        available_hours=3.0,
        factors=["Tight schedule window", "Severe capacity deficit"],
    )
    res = await provider.explain_risk_and_priority(req)
    assert "CRITICAL" in res.summary
    assert "Deficit Alert" in res.risk_explanation
    assert len(res.actionable_recommendations) >= 2


@pytest.mark.asyncio
async def test_ai_service_facade():
    service = AIService()
    assert service.interpreter is not None
    assert service.decomposer is not None
    assert service.effort_estimator is not None
    assert service.explainer is not None
    assert service.planner_assistant is not None

    res = await service.interpreter.interpret("Build database migration script in 2h")
    assert res.estimated_hours == 2.0
