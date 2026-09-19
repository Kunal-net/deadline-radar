from __future__ import annotations

import abc
import json
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Type, TypeVar
import httpx
from pydantic import BaseModel

from app.core.config import settings
from app.services.ai.schemas import (
    DecompositionRequest,
    DecompositionResponse,
    EffortEstimationRequest,
    EffortEstimationResponse,
    ExplanationRequest,
    ExplanationResponse,
    ExtractedSubtask,
    PlanningAssistanceRequest,
    PlanningAssistanceResponse,
    SuggestedUnit,
    WorkInterpretationRequest,
    WorkInterpretationResponse,
)

logger = logging.getLogger("deadline_radar.ai.provider")
T = TypeVar("T", bound=BaseModel)


class BaseAIProvider(abc.ABC):
    @abc.abstractmethod
    async def interpret_work(self, request: WorkInterpretationRequest) -> WorkInterpretationResponse:
        pass

    @abc.abstractmethod
    async def decompose_work(self, request: DecompositionRequest) -> DecompositionResponse:
        pass

    @abc.abstractmethod
    async def estimate_effort(self, request: EffortEstimationRequest) -> EffortEstimationResponse:
        pass

    @abc.abstractmethod
    async def explain_risk_and_priority(self, request: ExplanationRequest) -> ExplanationResponse:
        pass

    @abc.abstractmethod
    async def assist_planning(self, request: PlanningAssistanceRequest) -> PlanningAssistanceResponse:
        pass


class MockAIProvider(BaseAIProvider):
    """
    Deterministic, zero-dependency, heuristic-calibrated AI Provider.
    Extracts structured domain data from natural language, provides calibrated
    effort estimations, decomposes projects, and generates human explanations.
    """

    async def interpret_work(self, request: WorkInterpretationRequest) -> WorkInterpretationResponse:
        text = request.text.strip()
        lower = text.lower()

        # 1. Category Detection
        category = "academic"
        if any(w in lower for w in ["exam", "midterm", "quiz", "final", "test", "study"]):
            category = "exam_prep"
        elif any(w in lower for w in ["interview", "resume", "job", "career", "application"]):
            category = "career"
        elif any(w in lower for w in ["project", "build", "code", "develop", "system", "app"]):
            category = "project"
        elif any(w in lower for w in ["bill", "register", "submit form", "admin", "email"]):
            category = "administrative"
        elif any(w in lower for w in ["gym", "workout", "clean", "read", "personal"]):
            category = "personal"

        # 2. Effort Detection (e.g. "4 hours", "3h", "90 mins")
        hours = 2.0
        hour_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)", lower)
        min_match = re.search(r"(\d+)\s*(?:minutes?|mins?|m\b)", lower)
        if hour_match:
            hours = float(hour_match.group(1))
        elif min_match:
            hours = round(float(min_match.group(1)) / 60.0, 1)

        # 3. Deadline Detection
        now = datetime.now(timezone.utc)
        if request.context_date:
            try:
                parsed_ctx = datetime.fromisoformat(request.context_date.replace("Z", "+00:00"))
                if parsed_ctx.tzinfo is None:
                    parsed_ctx = parsed_ctx.replace(tzinfo=timezone.utc)
                now = parsed_ctx
            except Exception:
                pass
        deadline_dt = None
        if "tomorrow" in lower:
            deadline_dt = (now + timedelta(days=1)).replace(hour=18, minute=0, second=0, microsecond=0)
        elif "friday" in lower:
            days_ahead = (4 - now.weekday()) % 7
            days_ahead = 7 if days_ahead == 0 else days_ahead
            deadline_dt = (now + timedelta(days=days_ahead)).replace(hour=18, minute=0, second=0, microsecond=0)
        elif "next week" in lower:
            deadline_dt = (now + timedelta(days=7)).replace(hour=18, minute=0, second=0, microsecond=0)
        elif "monday" in lower:
            days_ahead = (0 - now.weekday()) % 7
            days_ahead = 7 if days_ahead == 0 else days_ahead
            deadline_dt = (now + timedelta(days=days_ahead)).replace(hour=18, minute=0, second=0, microsecond=0)
        else:
            in_days_match = re.search(r"in\s*(\d+)\s*days?", lower)
            if in_days_match:
                days_val = int(in_days_match.group(1))
                deadline_dt = (now + timedelta(days=days_val)).replace(hour=18, minute=0, second=0, microsecond=0)

        # 4. Title Extraction
        clean_title = text.split(".")[0].strip()
        clean_title = re.sub(r"^(finish|complete|do|prepare for|work on)\s+", "", clean_title, flags=re.IGNORECASE)
        clean_title = clean_title.capitalize()
        if len(clean_title) > 60:
            clean_title = clean_title[:57] + "..."

        # 5. Deliverables & Constraints
        deliverable = None
        if "report" in lower:
            deliverable = "Written Report"
        elif "code" in lower or "app" in lower or "repo" in lower:
            deliverable = "Code Repository & Implementation"
        elif "slides" in lower or "presentation" in lower:
            deliverable = "Presentation Slide Deck"

        constraints = []
        if "submit" in lower or "canvas" in lower or "portal" in lower:
            constraints.append("Must be submitted via student/course portal.")
        if "team" in lower or "group" in lower:
            constraints.append("Requires coordination with group members.")

        # 6. Suggested Subtasks
        subtasks = []
        if category == "exam_prep":
            subtasks = [
                ExtractedSubtask(sequence_order=1, title="Review Key Concepts & Lectures", estimated_hours=round(hours * 0.4, 1)),
                ExtractedSubtask(sequence_order=2, title="Practice Problem Sets & Mock Questions", estimated_hours=round(hours * 0.4, 1)),
                ExtractedSubtask(sequence_order=3, title="Final Formula Sheet & Weak Spot Review", estimated_hours=round(hours * 0.2, 1)),
            ]
        elif category == "project":
            subtasks = [
                ExtractedSubtask(sequence_order=1, title="Core Architecture & Implementation", estimated_hours=round(hours * 0.5, 1)),
                ExtractedSubtask(sequence_order=2, title="Testing, Edge Cases & Verification", estimated_hours=round(hours * 0.3, 1)),
                ExtractedSubtask(sequence_order=3, title="Documentation & Submission Packaging", estimated_hours=round(hours * 0.2, 1)),
            ]
        else:
            subtasks = [
                ExtractedSubtask(sequence_order=1, title="Initial Research & Outline", estimated_hours=round(hours * 0.3, 1)),
                ExtractedSubtask(sequence_order=2, title="Execution & Deep Work Draft", estimated_hours=round(hours * 0.5, 1)),
                ExtractedSubtask(sequence_order=3, title="Proofread, Polish & Submit", estimated_hours=round(hours * 0.2, 1)),
            ]

        # 7. Missing Information
        missing = []
        if deadline_dt is None:
            missing.append("No explicit deadline was specified.")
        if not deliverable:
            missing.append("Target deliverable format is unstated.")
        if hour_match is None and min_match is None:
            missing.append("No effort estimate was stated; assigned baseline estimate.")

        return WorkInterpretationResponse(
            title=clean_title,
            description=f"Extracted from user note: '{text}'",
            category=category,
            deadline_utc=deadline_dt.isoformat() if deadline_dt else None,
            is_hard_deadline=True,
            estimated_hours=hours,
            deliverable=deliverable,
            constraints=constraints,
            suggested_subtasks=subtasks,
            missing_information=missing,
            confidence_score=0.88 if deadline_dt else 0.72,
        )

    async def decompose_work(self, request: DecompositionRequest) -> DecompositionResponse:
        title = request.effective_title
        total_hours = request.estimated_hours if (request.estimated_hours and request.estimated_hours > 0) else 4.5
        cat = (request.category or "academic").lower()

        units: List[SuggestedUnit] = []
        if cat == "exam_prep":
            units = [
                SuggestedUnit(sequence_order=1, title=f"Review lecture notes & core theorems for {title}", estimated_hours=round(total_hours * 0.35, 1), dependencies=[]),
                SuggestedUnit(sequence_order=2, title="Solve past exam questions & problem sets", estimated_hours=round(total_hours * 0.40, 1), dependencies=[1]),
                SuggestedUnit(sequence_order=3, title="Timed mock exam simulation & error analysis", estimated_hours=round(total_hours * 0.25, 1), dependencies=[2]),
            ]
        elif cat == "project":
            units = [
                SuggestedUnit(sequence_order=1, title=f"System architecture & schema design for {title}", estimated_hours=round(total_hours * 0.25, 1), dependencies=[]),
                SuggestedUnit(sequence_order=2, title="Core logic & service implementation", estimated_hours=round(total_hours * 0.45, 1), dependencies=[1]),
                SuggestedUnit(sequence_order=3, title="Unit tests, integration checks & bug fixing", estimated_hours=round(total_hours * 0.20, 1), dependencies=[2]),
                SuggestedUnit(sequence_order=4, title="Documentation, README & demo preparation", estimated_hours=round(total_hours * 0.10, 1), dependencies=[3]),
            ]
        else:
            units = [
                SuggestedUnit(sequence_order=1, title=f"Literature & source material collection for {title}", estimated_hours=round(total_hours * 0.25, 1), dependencies=[]),
                SuggestedUnit(sequence_order=2, title="First comprehensive working draft", estimated_hours=round(total_hours * 0.50, 1), dependencies=[1]),
                SuggestedUnit(sequence_order=3, title="Review, proofreading, citation validation & final export", estimated_hours=round(total_hours * 0.25, 1), dependencies=[2]),
            ]

        computed_total = sum(u.estimated_hours for u in units)

        missing = []
        if request.estimated_hours is None:
            missing.append("No initial target effort was specified; calibrated heuristic baseline applied.")

        return DecompositionResponse(
            suggested_category=cat,
            suggested_units=units,
            total_estimated_hours=round(computed_total, 1),
            confidence_score=0.90 if request.estimated_hours else 0.82,
            reasoning_summary=f"Structured progressive breakdown of '{title}' into {len(units)} sequential milestones.",
            decomposition_notes=f"Decomposed '{title}' into {len(units)} discrete, actionable focus milestones.",
            detected_missing_information=missing,
        )

    async def estimate_effort(self, request: EffortEstimationRequest) -> EffortEstimationResponse:
        complexity = (request.complexity or "moderate").lower()
        cat = request.category.lower()

        # Sizing table based on complexity
        base_map = {
            "simple": 2.0,
            "moderate": 5.0,
            "complex": 10.0,
            "massive": 25.0,
        }
        baseline = base_map.get(complexity, 5.0)

        # Category adjustments
        if cat == "exam_prep":
            baseline *= 1.2
        elif cat == "project":
            baseline *= 1.3
        elif cat == "administrative":
            baseline *= 0.5

        if request.units_count and request.units_count > 0:
            # 1 to 2 hours per unit expected average
            unit_based = request.units_count * 1.5
            baseline = round((baseline + unit_based) / 2.0, 1)

        baseline = round(baseline, 1)
        min_hours = max(0.5, round(baseline * 0.75, 1))
        max_hours = round(baseline * 1.4, 1)

        return EffortEstimationResponse(
            baseline_hours=baseline,
            min_expected_hours=min_hours,
            max_expected_hours=max_hours,
            confidence_score=0.82,
            estimation_rationale=(
                f"Calibrated estimate for {complexity} {cat} task: "
                f"expected range between {min_hours}h and {max_hours}h (nominal baseline: {baseline}h)."
            ),
        )

    async def explain_risk_and_priority(self, request: ExplanationRequest) -> ExplanationResponse:
        risk_str = request.risk_state.upper()
        prio_score = request.dynamic_priority

        summary = f"Item '{request.title}' is currently ranked at priority {prio_score:.1f}/100 with {risk_str} deadline risk."

        if request.risk_state in {"critical", "overdue"}:
            risk_exp = (
                f"Deficit Alert: {request.remaining_hours:.1f}h of work remaining against only "
                f"{request.available_hours:.1f}h of suitable capacity before cutoff. "
                f"Risk ratio is {request.risk_ratio:.2f}x available time."
            )
        elif request.risk_state == "at_risk":
            risk_exp = (
                f"Buffer Warning: {request.remaining_hours:.1f}h required with {request.available_hours:.1f}h "
                f"available. Buffer is narrow and vulnerable to unexpected delays."
            )
        else:
            risk_exp = (
                f"Healthy Schedule: {request.remaining_hours:.1f}h remaining with comfortable "
                f"{request.available_hours:.1f}h capacity buffer before deadline."
            )

        prio_exp = (
            f"Dynamic Priority ({prio_score:.1f}) is driven by "
            f"{'urgent deadline countdown and capacity deficit' if prio_score >= 70 else 'scheduled progression'}."
        )

        recs = []
        if request.risk_state in {"critical", "at_risk"}:
            recs.append("Schedule an immediate 90-minute deep work block today.")
            recs.append("Decompose remaining units to isolate the minimal viable deliverable.")
            recs.append("Consider postponing non-urgent commitments to recover buffer.")
        else:
            recs.append("Maintain steady progression according to daily plan.")

        return ExplanationResponse(
            summary=summary,
            risk_explanation=risk_exp,
            priority_explanation=prio_exp,
            actionable_recommendations=recs,
        )

    async def assist_planning(self, request: PlanningAssistanceRequest) -> PlanningAssistanceResponse:
        avail = request.available_capacity_hours
        alloc = request.allocated_hours

        if alloc > avail:
            advice = f"Day is over-allocated ({alloc:.1f}h scheduled vs {avail:.1f}h available capacity). Defer lowest priority items to avoid burnout."
            adjustments = ["Shift second-tier tasks to tomorrow.", "Protect at least 1 personal interest slot."]
            strategy = "Aggressive triaging: focus only on critical path items."
        elif alloc >= avail * 0.8:
            advice = f"Day is well-balanced ({alloc:.1f}h allocated of {avail:.1f}h capacity). A realistic and productive day."
            adjustments = ["Keep 15-minute breaks between deep work sessions."]
            strategy = "Monotasking: execute top priority work in the morning focus window."
        else:
            advice = f"Light workload ({alloc:.1f}h allocated of {avail:.1f}h capacity). Opportunity to get ahead on upcoming milestones."
            adjustments = ["Pull in upcoming subtask if feeling energized."]
            strategy = "Early milestone progression and recovery."

        return PlanningAssistanceResponse(
            advice=advice,
            suggested_adjustments=adjustments,
            focus_strategy=strategy,
        )


class GeminiProvider(BaseAIProvider):
    """
    Google Gemini AI Provider with robust schema generation and automatic Mock fallback.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback = MockAIProvider()

    async def interpret_work(self, request: WorkInterpretationRequest) -> WorkInterpretationResponse:
        if not self.api_key:
            return await self.fallback.interpret_work(request)
        try:
            # Live call with strict timeout
            async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                prompt = (
                    f"Extract work parameters from this natural language text: '{request.text}'. "
                    f"Context date is: {request.context_date or 'today'}. "
                    "Respond with a strict JSON object matching: "
                    "title, description, category, deadline_utc, is_hard_deadline, estimated_hours, "
                    "deliverable, constraints (list), suggested_subtasks (list with sequence_order, title, estimated_hours), "
                    "missing_information (list), confidence_score (float)."
                )
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"},
                }
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_text)
                    return WorkInterpretationResponse(**parsed)
        except Exception as e:
            logger.warning(f"Gemini API request failed, falling back to heuristic engine: {e}")

        return await self.fallback.interpret_work(request)

    async def decompose_work(self, request: DecompositionRequest) -> DecompositionResponse:
        if not self.api_key:
            return await self.fallback.decompose_work(request)
        try:
            async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                prompt = (
                    f"Decompose work item '{request.effective_title}' (Category: {request.category}, Total: {request.estimated_hours}h) "
                    "into 3-5 sequential work units with title, description, and estimated_hours. "
                    "Respond in JSON matching: suggested_units (list), total_estimated_hours, confidence_score, decomposition_notes."
                )
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"},
                }
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_text)
                    return DecompositionResponse(**parsed)
        except Exception as e:
            logger.warning(f"Gemini API decomposition failed, falling back: {e}")

        return await self.fallback.decompose_work(request)

    async def estimate_effort(self, request: EffortEstimationRequest) -> EffortEstimationResponse:
        return await self.fallback.estimate_effort(request)

    async def explain_risk_and_priority(self, request: ExplanationRequest) -> ExplanationResponse:
        return await self.fallback.explain_risk_and_priority(request)

    async def assist_planning(self, request: PlanningAssistanceRequest) -> PlanningAssistanceResponse:
        return await self.fallback.assist_planning(request)


class ClaudeProvider(BaseAIProvider):
    """
    Anthropic Claude Provider with automatic Mock fallback.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.fallback = MockAIProvider()

    async def interpret_work(self, request: WorkInterpretationRequest) -> WorkInterpretationResponse:
        return await self.fallback.interpret_work(request)

    async def decompose_work(self, request: DecompositionRequest) -> DecompositionResponse:
        return await self.fallback.decompose_work(request)

    async def estimate_effort(self, request: EffortEstimationRequest) -> EffortEstimationResponse:
        return await self.fallback.estimate_effort(request)

    async def explain_risk_and_priority(self, request: ExplanationRequest) -> ExplanationResponse:
        return await self.fallback.explain_risk_and_priority(request)

    async def assist_planning(self, request: PlanningAssistanceRequest) -> PlanningAssistanceResponse:
        return await self.fallback.assist_planning(request)


def get_ai_provider() -> BaseAIProvider:
    provider_name = (settings.AI_PROVIDER or "mock").lower()
    if provider_name == "gemini":
        return GeminiProvider()
    elif provider_name == "claude":
        return ClaudeProvider()
    return MockAIProvider()
