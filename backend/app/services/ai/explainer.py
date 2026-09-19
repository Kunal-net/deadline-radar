from __future__ import annotations

from typing import List, Optional, Union
from app.services.ai.provider import BaseAIProvider, get_ai_provider
from app.services.ai.schemas import ExplanationRequest, ExplanationResponse


class ExplanationGenerator:
    def __init__(self, provider: BaseAIProvider | None = None):
        self.provider = provider or get_ai_provider()

    async def explain(
        self,
        request_or_title: Union[ExplanationRequest, str],
        risk_state: Optional[str] = None,
        risk_ratio: Optional[float] = None,
        dynamic_priority: Optional[float] = None,
        remaining_hours: Optional[float] = None,
        available_hours: Optional[float] = None,
        factors: Optional[List[str]] = None,
        days_until_deadline: Optional[float] = None,
        work_id: Optional[str] = None,
    ) -> ExplanationResponse:
        if isinstance(request_or_title, ExplanationRequest):
            return await self.provider.explain_risk_and_priority(request_or_title)

        req = ExplanationRequest(
            work_id=work_id,
            title=request_or_title,
            risk_state=risk_state or "safe",
            risk_ratio=risk_ratio or 0.0,
            dynamic_priority=dynamic_priority or 0.0,
            remaining_hours=remaining_hours or 0.0,
            available_hours=available_hours or 0.0,
            days_until_deadline=days_until_deadline,
            factors=factors or [],
        )
        return await self.provider.explain_risk_and_priority(req)
