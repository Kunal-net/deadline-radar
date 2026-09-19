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
        description: Optional[str] = None,
        units_count: Optional[int] = None,
        user_pace_factor: Optional[float] = None,
        historical_observations_count: Optional[int] = 0,
    ) -> EffortEstimationResponse:
        req = EffortEstimationRequest(
            title=title,
            category=category,
            complexity=complexity,
            description=description,
            units_count=units_count,
            user_pace_factor=user_pace_factor,
            historical_observations_count=historical_observations_count,
        )
        return await self.provider.estimate_effort(req)
