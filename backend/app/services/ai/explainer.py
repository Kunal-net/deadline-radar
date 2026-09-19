from __future__ import annotations

from typing import List, Optional
from app.services.ai.provider import BaseAIProvider, get_ai_provider
from app.services.ai.schemas import ExplanationRequest, ExplanationResponse


class ExplanationGenerator:
    def __init__(self, provider: BaseAIProvider | None = None):
        self.provider = provider or get_ai_provider()

    async def explain(
        self,
        title: str,
        risk_state: str,
        risk_ratio: float,
        dynamic_priority: float,
        remaining_hours: float,
        available_hours: float,
        factors: Optional[List[str]] = None,
        days_until_deadline: Optional[float] = None,
        work_id: Optional[str] = None,
    ) -> ExplanationResponse:
        req = ExplanationRequest(
            work_id=work_id,
            title=title,
            risk_state=risk_state,
            risk_ratio=risk_ratio,
            dynamic_priority=dynamic_priority,
            remaining_hours=remaining_hours,
            available_hours=available_hours,
            days_until_deadline=days_until_deadline,
            factors=factors or [],
        )
        return await self.provider.explain_risk_and_priority(req)
