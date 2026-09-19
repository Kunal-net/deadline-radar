from __future__ import annotations

from typing import Optional
from app.services.ai.provider import BaseAIProvider, get_ai_provider
from app.services.ai.schemas import EffortEstimationRequest, EffortEstimationResponse


class EffortEstimator:
    def __init__(self, provider: BaseAIProvider | None = None):
        self.provider = provider or get_ai_provider()

    async def estimate(
        self,
        title: str,
        category: str = "academic",
        complexity: str = "moderate",
        units_count: Optional[int] = None,
    ) -> EffortEstimationResponse:
        req = EffortEstimationRequest(
            title=title,
            category=category,
            complexity=complexity,
            units_count=units_count,
        )
        return await self.provider.estimate_effort(req)
