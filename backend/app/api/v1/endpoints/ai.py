from __future__ import annotations

import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, status

from app.api.deps import get_ai_service, get_current_user
from app.models.user import User
from app.services.ai.ai_service import AIService
from app.services.ai.schemas import (
    WorkInterpretationRequest,
    WorkInterpretationResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/interpret",
    response_model=WorkInterpretationResponse,
    status_code=status.HTTP_200_OK,
    summary="Natural Language Work Interpretation",
    description=(
        "Parses unstructured natural language notes, syllabi fragments, or project descriptions "
        "into candidate structured work entities (title, deadline, category, effort, deliverables, subtasks) "
        "and highlights ambiguities or missing details for user confirmation before persistence."
    ),
)
async def interpret_work_text(
    payload: WorkInterpretationRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
) -> WorkInterpretationResponse:
    logger.info(
        "Interpreting work description for user_id=%s (text_length=%d)",
        current_user.id,
        len(payload.text),
    )
    result = await ai_service.interpreter.interpret(
        text=payload.text,
        context_date=payload.context_date,
    )
    return result
