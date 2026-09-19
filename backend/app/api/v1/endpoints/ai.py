from __future__ import annotations

import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_ai_service, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.work import WorkItemResponse, WorkUnitCreateRequest
from app.services.ai.ai_service import AIService
from app.services.ai.schemas import (
    ApplyDecompositionRequest,
    DecompositionRequest,
    DecompositionResponse,
    WorkInterpretationRequest,
    WorkInterpretationResponse,
)
from app.services.work_service import WorkService

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


@router.post(
    "/decompose",
    response_model=DecompositionResponse,
    status_code=status.HTTP_200_OK,
    summary="AI Work Decomposition",
    description=(
        "Decomposes complex projects or assignments into actionable, ordered subtasks "
        "with effort allocations, dependency tracking, and calibrated milestones."
    ),
)
async def decompose_work(
    payload: DecompositionRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
) -> DecompositionResponse:
    title = payload.effective_title
    logger.info(
        "Decomposing work '%s' (category=%s) for user_id=%s",
        title,
        payload.category,
        current_user.id,
    )
    return await ai_service.decomposer.decompose(
        work_title=title,
        category=payload.category,
        description=payload.description,
        estimated_hours=payload.estimated_hours,
        deadline_utc=payload.deadline_utc or payload.target_deadline,
    )


@router.post(
    "/work/{work_id}/decompose",
    response_model=DecompositionResponse,
    status_code=status.HTTP_200_OK,
    summary="Decompose Existing Work Item",
    description="Decomposes an existing work item into candidate subtasks based on its current title, description, and effort.",
)
async def decompose_existing_work(
    work_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
) -> DecompositionResponse:
    work_service = WorkService(db)
    item = await work_service.get_work_item(work_id, current_user.id)

    deadline_str = (
        item.deadline_utc.isoformat()
        if hasattr(item.deadline_utc, "isoformat")
        else (str(item.deadline_utc) if item.deadline_utc else None)
    )

    return await ai_service.decomposer.decompose(
        work_title=item.title,
        category=item.category,
        description=item.description,
        estimated_hours=item.remaining_estimated_hours,
        deadline_utc=deadline_str,
    )


@router.post(
    "/work/{work_id}/apply-decomposition",
    response_model=WorkItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Apply User-Confirmed Decomposition Units",
    description="Persists user-confirmed decomposed subtasks into an existing work item, recalculating remaining effort.",
)
async def apply_decomposition(
    work_id: str,
    payload: ApplyDecompositionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkItemResponse:
    work_service = WorkService(db)
    # Validate work item existence and ownership
    item = await work_service.get_work_item(work_id, current_user.id)

    for unit in payload.units:
        unit_req = WorkUnitCreateRequest(
            title=unit.title,
            description=unit.description,
            sequence_order=unit.sequence_order,
            estimated_hours=unit.estimated_hours,
        )
        await work_service.add_unit(work_id, current_user.id, unit_req)

    return await work_service.get_work_item(work_id, current_user.id)
