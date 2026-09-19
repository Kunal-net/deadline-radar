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
    EffortEstimationRequest,
    EffortEstimationResponse,
    ExplanationRequest,
    ExplanationResponse,
    PlanningAssistanceRequest,
    PlanningAssistanceResponse,
    WorkInterpretationRequest,
    WorkInterpretationResponse,
)
from app.services.work_service import WorkService
from app.repositories.work_repo import WorkItemRepository

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


@router.post(
    "/estimate-effort",
    response_model=EffortEstimationResponse,
    status_code=status.HTTP_200_OK,
    summary="AI-Assisted Effort Estimation",
    description=(
        "Produces calibrated probabilistic effort estimates with confidence intervals, "
        "incorporating complexity, work category, and personal historical pace factor when sufficient observations exist."
    ),
)
async def estimate_work_effort(
    payload: EffortEstimationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
) -> EffortEstimationResponse:
    # Query user's pace factor record and completed history
    work_repo = WorkItemRepository(db)
    _, total_completed = await work_repo.list_work_items(user_id=current_user.id, status="completed", limit=1)
    obs_count = total_completed

    from app.models.pace_factor import UserPaceFactor
    from sqlalchemy import select
    stmt = select(UserPaceFactor).where(
        UserPaceFactor.user_id == current_user.id,
        UserPaceFactor.category == payload.category,
    )
    pace_res = await db.execute(stmt)
    user_pace_rec = pace_res.scalar_one_or_none()

    pace_factor = 1.0
    if user_pace_rec and user_pace_rec.sample_count >= 3:
        pace_factor = user_pace_rec.pace_factor
        obs_count = max(obs_count, user_pace_rec.sample_count)

    if payload.user_pace_factor is not None:
        pace_factor = payload.user_pace_factor
    if payload.historical_observations_count and payload.historical_observations_count > obs_count:
        obs_count = payload.historical_observations_count

    logger.info(
        "Estimating effort for '%s' (user_id=%s, obs_count=%d, pace_factor=%.2f)",
        payload.title,
        current_user.id,
        obs_count,
        pace_factor,
    )

    return await ai_service.effort_estimator.estimate(
        title=payload.title,
        category=payload.category,
        complexity=payload.complexity or "moderate",
        description=payload.description,
        units_count=payload.units_count,
        user_pace_factor=pace_factor,
        historical_observations_count=obs_count,
    )


@router.post(
    "/plan-assist",
    response_model=PlanningAssistanceResponse,
    status_code=status.HTTP_200_OK,
    summary="AI Planning Assistance",
    description=(
        "Evaluates schedule pressure, trade-offs, sequencing, and conflict risks around the deterministic daily plan. "
        "Deterministic capacity and constraints remain strictly authoritative."
    ),
)
async def assist_planning(
    payload: PlanningAssistanceRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
) -> PlanningAssistanceResponse:
    logger.info(
        "Generating planning assistance for user_id=%s (date=%s, alloc=%.1f, avail=%.1f)",
        current_user.id,
        payload.date,
        payload.allocated_hours,
        payload.available_capacity_hours,
    )
    return await ai_service.planner_assistant.assist(
        date=payload.date,
        available_capacity_hours=payload.available_capacity_hours,
        allocated_hours=payload.allocated_hours,
        top_items=payload.top_items,
        conflicts=payload.conflicts,
    )


@router.post(
    "/explain",
    response_model=ExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Grounded AI Explanation",
    description="Generates concise, human-understandable explanations for deadline risk, priority drivers, and capacity gaps grounded strictly in validated numbers.",
)
async def explain_metrics(
    payload: ExplanationRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
) -> ExplanationResponse:
    logger.info("Generating AI explanation for '%s' (user_id=%s)", payload.title, current_user.id)
    return await ai_service.explainer.explain(payload)


@router.get(
    "/work/{work_id}/explanation",
    response_model=ExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Explain Work Item Risk & Priority",
    description="Loads active work item telemetry and generates a grounded, concise natural language explanation for why it is risky or prioritized.",
)
async def explain_work_item(
    work_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
) -> ExplanationResponse:
    from datetime import datetime, timezone
    work_service = WorkService(db)
    item = await work_service.get_work_item(work_id, current_user.id)

    now = datetime.now(timezone.utc)
    days_left = None
    if item.deadline_utc:
        try:
            dl = datetime.fromisoformat(item.deadline_utc.replace("Z", "+00:00"))
            days_left = max(0.0, round((dl - now).total_seconds() / 86400.0, 1))
        except Exception:
            pass

    avail = (
        round(item.remaining_estimated_hours / item.risk_ratio, 1)
        if (item.risk_ratio and item.risk_ratio > 0)
        else 8.0
    )

    req = ExplanationRequest(
        work_id=item.id,
        title=item.title,
        risk_state=item.risk_state,
        risk_ratio=item.risk_ratio,
        dynamic_priority=item.dynamic_priority,
        remaining_hours=item.remaining_estimated_hours,
        available_hours=avail,
        days_until_deadline=days_left,
        factors=[item.priority_explanation] if item.priority_explanation else [],
    )
    return await ai_service.explainer.explain(req)
