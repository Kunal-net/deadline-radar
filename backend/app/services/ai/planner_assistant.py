from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.services.ai.provider import BaseAIProvider, get_ai_provider
from app.services.ai.schemas import PlanningAssistanceRequest, PlanningAssistanceResponse


class PlanningAssistant:
    def __init__(self, provider: BaseAIProvider | None = None):
        self.provider = provider or get_ai_provider()

    async def assist(
        self,
        date: str,
        available_capacity_hours: float,
        allocated_hours: float,
        top_items: Optional[List[Dict[str, Any]]] = None,
        conflicts: Optional[List[str]] = None,
    ) -> PlanningAssistanceResponse:
        req = PlanningAssistanceRequest(
            date=date,
            available_capacity_hours=available_capacity_hours,
            allocated_hours=allocated_hours,
            top_items=top_items or [],
            conflicts=conflicts or [],
        )
        return await self.provider.assist_planning(req)
