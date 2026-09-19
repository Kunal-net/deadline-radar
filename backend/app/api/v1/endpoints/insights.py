from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_ai_service, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.insights import InsightsSummaryResponse, RecalibratePaceResponse
from app.services.ai.ai_service import AIService
from app.services.ai.personalization_service import PersonalizationService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/summary",
    response_model=InsightsSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="User Pace & Personalization Telemetry",
    description=(
        "Returns empirical execution variance, estimation accuracy, signed error, "
        "rolling prediction bias, and category-level pace factors learned from completed work."
    ),
)
async def get_insights_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InsightsSummaryResponse:
    service = PersonalizationService(db)
    return await service.get_insights_summary(current_user.id)


@router.post(
    "/recalibrate-pace",
    response_model=RecalibratePaceResponse,
    status_code=status.HTTP_200_OK,
    summary="Recalibrate Personal Pace Factors",
    description=(
        "Processes observed actual execution time versus estimated duration across completed items "
        "to update category pace factors with gradual exponential damping."
    ),
)
async def recalibrate_pace(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RecalibratePaceResponse:
    service = PersonalizationService(db)
    return await service.recalibrate_all(current_user.id)
