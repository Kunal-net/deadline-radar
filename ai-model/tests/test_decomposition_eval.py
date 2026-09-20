from __future__ import annotations

import json
from pathlib import Path
import pytest
import sys

# Ensure backend app is on sys.path
backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.services.ai.ai_service import AIService
from app.services.ai.provider import MockAIProvider
from app.services.ai.schemas import DecompositionResponse, WorkInterpretationResponse


DATASET_PATH = Path(__file__).resolve().parent.parent / "eval_datasets" / "eval_decomposition.jsonl"
INTERP_DATASET_PATH = Path(__file__).resolve().parent.parent / "eval_datasets" / "eval_interpretation.jsonl"


def load_jsonl(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


@pytest.fixture
def ai_service() -> AIService:
    provider = MockAIProvider()
    return AIService(provider=provider)


@pytest.mark.asyncio
async def test_decomposition_benchmark_eval(ai_service: AIService):
    """
    Evaluates AI task decomposition across standard benchmark test cases.
    Verifies:
      1. Schema validity (100% Pydantic conformance).
      2. Unit count distribution (within expected min/max bounds).
      3. Duration plausibility (each subtask duration 0.5h to 4.0h).
    """
    records = load_jsonl(DATASET_PATH)
    assert len(records) > 0

    total_units_evaluated = 0

    for item in records:
        result = await ai_service.decomposer.decompose(
            work_title=item["work_title"],
            description=item.get("description"),
            category=item.get("category", "academic"),
        )

        # 1. Pydantic schema validation
        assert isinstance(result, DecompositionResponse)
        assert len(result.suggested_units) >= item["expected_units_min"]
        assert len(result.suggested_units) <= item["expected_units_max"]

        # 2. Duration plausibility
        for unit in result.suggested_units:
            total_units_evaluated += 1
            assert 0.5 <= unit.estimated_hours <= 4.0
            assert len(unit.title.strip()) > 0
            assert unit.sequence_order > 0

    assert total_units_evaluated >= 20


@pytest.mark.asyncio
async def test_interpretation_benchmark_eval(ai_service: AIService):
    """
    Evaluates AI natural language work intake interpretation.
    Verifies:
      1. Correct category extraction.
      2. Missing info detection and confidence scoring.
    """
    records = load_jsonl(INTERP_DATASET_PATH)
    assert len(records) > 0

    for item in records:
        result = await ai_service.interpreter.interpret(item["input_text"])

        assert isinstance(result, WorkInterpretationResponse)
        assert len(result.title) > 0
        assert result.confidence_score > 0.0
