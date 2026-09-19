from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pace_factor import UserPaceFactor
from app.models.time_entry import TimeEntry
from app.models.work_item import WorkItem
from app.models.work_unit import WorkUnit
from app.schemas.insights import (
    CategoryPaceBreakdown,
    InsightsSummaryResponse,
    RecalibratePaceResponse,
)

logger = logging.getLogger("deadline_radar.personalization")


class PersonalizationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def update_pace_factor(
        self,
        user_id: str,
        category: str = "academic",
    ) -> UserPaceFactor:
        """
        Recalibrates the user's category pace factor from observed actual vs estimated hours.
        Implements gradual learning (exponential damping) to avoid outlier distortions.
        PaceFactor = ActualHours / EstimatedHours.
        Values > 1.0 indicate user takes longer than estimated (pessimistic adjustment needed).
        Values < 1.0 indicate user works faster than estimated.
        """
        # Fetch completed work units for this user and category
        stmt = (
            select(
                func.sum(WorkUnit.actual_hours).label("total_actual"),
                func.sum(WorkUnit.estimated_hours).label("total_est"),
                func.count(WorkUnit.id).label("samples"),
            )
            .join(WorkItem, WorkItem.id == WorkUnit.work_item_id)
            .where(
                WorkUnit.user_id == user_id,
                WorkItem.category == category,
                WorkUnit.is_completed == True,
                WorkUnit.actual_hours > 0,
            )
        )
        res = await self.db.execute(stmt)
        row = res.one()

        total_actual = float(row.total_actual or 0.0)
        total_est = float(row.total_est or 0.0)
        samples = int(row.samples or 0)

        # Check existing record for gradual learning
        existing_stmt = select(UserPaceFactor).where(
            UserPaceFactor.user_id == user_id,
            UserPaceFactor.category == category,
        )
        existing_res = await self.db.execute(existing_stmt)
        record = existing_res.scalar_one_or_none()

        # Cold start baseline default
        if samples < 3 or total_est <= 0.0:
            pace_factor = 1.0
            confidence = 0.35
        else:
            raw_ratio = total_actual / total_est
            raw_bounded = max(0.5, min(2.5, raw_ratio))

            if record and record.sample_count >= 2:
                # Gradual learning: 70% prior established model, 30% new empirical observations
                pace_factor = round(0.70 * record.pace_factor + 0.30 * raw_bounded, 2)
            else:
                pace_factor = round(raw_bounded, 2)

            # Confidence scales asymptotically with sample volume (1.0 at 12 samples)
            confidence = round(min(1.0, max(0.40, samples / 12.0)), 2)

        if record:
            record.pace_factor = pace_factor
            record.total_actual_hours = total_actual
            record.total_estimated_hours = total_est
            record.sample_count = samples
            record.confidence = confidence
            record.updated_at = datetime.now(timezone.utc)
        else:
            record = UserPaceFactor(
                user_id=user_id,
                category=category,
                pace_factor=pace_factor,
                total_actual_hours=total_actual,
                total_estimated_hours=total_est,
                sample_count=samples,
                confidence=confidence,
            )
            self.db.add(record)

        await self.db.flush()
        logger.info(
            "Updated pace factor for user_id=%s, category=%s: factor=%.2f, samples=%d, confidence=%.2f",
            user_id,
            category,
            pace_factor,
            samples,
            confidence,
        )
        return record

    async def get_pace_factor(self, user_id: str, category: str = "academic") -> float:
        stmt = (
            select(UserPaceFactor)
            .where(UserPaceFactor.user_id == user_id, UserPaceFactor.category == category)
            .order_by(UserPaceFactor.updated_at.desc())
            .limit(1)
        )
        res = await self.db.execute(stmt)
        rec = res.scalar_one_or_none()
        return rec.pace_factor if rec else 1.0

    async def recalibrate_all(self, user_id: str) -> RecalibratePaceResponse:
        """
        Recalibrates all categories present in user history and overall weighted pace.
        """
        # Find distinct categories in user's work items
        cat_stmt = select(WorkItem.category).where(WorkItem.user_id == user_id).distinct()
        cat_res = await self.db.execute(cat_stmt)
        categories = [r[0] for r in cat_res.all()]
        if not categories:
            categories = ["academic", "project", "career", "exam_prep"]

        updated_count = 0
        total_samples = 0
        factors = []
        for cat in categories:
            rec = await self.update_pace_factor(user_id=user_id, category=cat)
            if rec.sample_count > 0:
                updated_count += 1
                total_samples += rec.sample_count
                factors.append(rec.pace_factor)

        await self.db.commit()

        overall_pace = round(sum(factors) / len(factors), 2) if factors else 1.0

        learning_status = (
            "calibrated" if total_samples >= 10 else ("calibrating" if total_samples >= 3 else "cold_start")
        )

        return RecalibratePaceResponse(
            updated_categories=updated_count,
            overall_pace_factor=overall_pace,
            observations_processed=total_samples,
            learning_status=learning_status,
            message=f"Pace factor model updated ({learning_status}) across {updated_count} categories.",
        )

    async def get_insights_summary(self, user_id: str) -> InsightsSummaryResponse:
        """
        Assembles comprehensive pace telemetry, estimation accuracy, and historical variance.
        """
        # 1. Total tracked time
        tracked_stmt = select(func.sum(TimeEntry.duration_seconds)).where(TimeEntry.user_id == user_id)
        tracked_res = await self.db.execute(tracked_stmt)
        total_seconds = tracked_res.scalar() or 0
        total_tracked_hours = round(total_seconds / 3600.0, 1)

        # 2. Completed work items
        items_stmt = select(WorkItem).where(
            WorkItem.user_id == user_id,
            WorkItem.status == "completed",
        )
        items_res = await self.db.execute(items_stmt)
        completed_items = items_res.scalars().all()
        total_completed = len(completed_items)

        # 3. Error metrics & variance
        signed_errors: List[float] = []
        abs_errors: List[float] = []
        pct_errors: List[float] = []

        for it in completed_items:
            pred = it.total_estimated_hours
            actual = it.total_actual_hours
            if actual > 0:
                err = actual - pred
                signed_errors.append(err)
                abs_errors.append(abs(err))
                if pred > 0:
                    pct_errors.append(abs(err) / pred * 100.0)

        n_samples = len(signed_errors)
        if n_samples > 0:
            avg_signed = round(sum(signed_errors) / n_samples, 2)
            avg_abs = round(sum(abs_errors) / n_samples, 2)
            mean_pct_err = sum(pct_errors) / n_samples
            accuracy_pct = max(10, min(100, int(100.0 - mean_pct_err)))
        else:
            avg_signed = 0.0
            avg_abs = 0.0
            accuracy_pct = 100

        # Rolling bias interpretation
        if avg_signed > 0.35:
            rolling_bias = "underestimating"
        elif avg_signed < -0.35:
            rolling_bias = "overestimating"
        else:
            rolling_bias = "accurate"

        # 4. Category breakdowns
        pace_stmt = select(UserPaceFactor).where(UserPaceFactor.user_id == user_id)
        pace_res = await self.db.execute(pace_stmt)
        pace_records = pace_res.scalars().all()

        breakdowns: List[CategoryPaceBreakdown] = []
        for p in pace_records:
            pf = p.pace_factor
            if pf > 1.15:
                interp = f"Tends to take {int((pf - 1.0) * 100)}% longer than estimated for {p.category} work."
            elif pf < 0.85:
                interp = f"Works {int((1.0 - pf) * 100)}% faster than initial estimates for {p.category} tasks."
            else:
                interp = f"{p.category.capitalize()} estimates match actual execution pace closely."

            breakdowns.append(
                CategoryPaceBreakdown(
                    category=p.category,
                    pace_factor=pf,
                    sample_count=p.sample_count,
                    confidence=p.confidence,
                    interpretation=interp,
                )
            )

        overall_pace = (
            round(sum(p.pace_factor for p in pace_records) / len(pace_records), 2)
            if pace_records
            else 1.0
        )

        learning_status = (
            "calibrated" if total_completed >= 10 else ("calibrating" if total_completed >= 3 else "cold_start")
        )
        conf_level = "high" if total_completed >= 10 else ("medium" if total_completed >= 3 else "low")

        return InsightsSummaryResponse(
            overall_pace_factor=overall_pace,
            confidence_level=conf_level,
            total_completed_tasks=total_completed,
            total_tracked_hours=total_tracked_hours,
            estimation_accuracy_pct=accuracy_pct,
            average_signed_error_hours=avg_signed,
            average_absolute_error_hours=avg_abs,
            rolling_bias=rolling_bias,
            category_breakdowns=breakdowns,
            learning_status=learning_status,
        )
