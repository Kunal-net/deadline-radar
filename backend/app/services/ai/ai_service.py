from __future__ import annotations

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.effort_estimator import EffortEstimator
from app.services.ai.explainer import ExplanationGenerator
from app.services.ai.personalization_service import PersonalizationService
from app.services.ai.planner_assistant import PlanningAssistant
from app.services.ai.provider import BaseAIProvider, get_ai_provider
from app.services.ai.work_decomposer import WorkDecomposer
from app.services.ai.work_interpreter import WorkInterpreter


class AIService:
    """
    Unified, modular AI service facade for Deadline Radar.
    Composes specialized sub-services for natural language interpretation,
    decomposition, effort estimation, explanations, and planning advice.
    """

    def __init__(self, db: Optional[AsyncSession] = None, provider: Optional[BaseAIProvider] = None):
        self.provider = provider or get_ai_provider()
        self.interpreter = WorkInterpreter(self.provider)
        self.decomposer = WorkDecomposer(self.provider)
        self.effort_estimator = EffortEstimator(self.provider)
        self.explainer = ExplanationGenerator(self.provider)
        self.planner_assistant = PlanningAssistant(self.provider)
        self.personalization = PersonalizationService(db) if db is not None else None
