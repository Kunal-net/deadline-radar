from __future__ import annotations

from app.services.ai.provider import BaseAIProvider, get_ai_provider
from app.services.ai.schemas import WorkInterpretationRequest, WorkInterpretationResponse


class WorkInterpreter:
    def __init__(self, provider: BaseAIProvider | None = None):
        self.provider = provider or get_ai_provider()

    async def interpret(self, text: str, context_date: str | None = None) -> WorkInterpretationResponse:
        req = WorkInterpretationRequest(text=text, context_date=context_date)
        return await self.provider.interpret_work(req)
