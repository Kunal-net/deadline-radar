from __future__ import annotations

from typing import Optional
from app.services.ai.provider import BaseAIProvider, get_ai_provider
from app.services.ai.schemas import DecompositionRequest, DecompositionResponse


class WorkDecomposer:
    def __init__(self, provider: BaseAIProvider | None = None):
        self.provider = provider or get_ai_provider()

    async def decompose(
        self,
        work_title: str,
        category: str = "academic",
        description: Optional[str] = None,
        estimated_hours: Optional[float] = None,
        deadline_utc: Optional[str] = None,
    ) -> DecompositionResponse:
        req = DecompositionRequest(
            work_title=work_title,
            category=category,
            description=description,
            estimated_hours=estimated_hours,
            deadline_utc=deadline_utc,
        )
        return await self.provider.decompose_work(req)
