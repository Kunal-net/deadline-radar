from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pace_factor import UserPaceFactor
from app.models.work_unit import WorkUnit

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
            .where(
                WorkUnit.user_id == user_id,
                WorkUnit.is_completed == True,
                WorkUnit.actual_hours > 0,
            )
        )
        res = await self.db.execute(stmt)
        row = res.one()

        total_actual = float(row.total_actual or 0.0)
        total_est = float(row.total_est or 0.0)
        samples = int(row.samples or 0)

        # Baseline default
        if samples < 2 or total_est <= 0.0:
            pace_factor = 1.0
            confidence = 0.3
        else:
            raw_ratio = total_actual / total_est
            # Bounded between 0.5 and 2.5 to avoid runaway distortions
            pace_factor = round(max(0.5, min(2.5, raw_ratio)), 2)
            # Confidence grows with sample count (reaches 1.0 at 15 samples)
            confidence = round(min(1.0, max(0.4, samples / 15.0)), 2)

        # Upsert or insert into UserPaceFactor
        existing_stmt = select(UserPaceFactor).where(
            UserPaceFactor.user_id == user_id,
            UserPaceFactor.category == category,
        )
        existing_res = await self.db.execute(existing_stmt)
        record = existing_res.scalar_one_or_none()

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
            f"Updated pace factor for user '{user_id}', category '{category}': "
            f"factor={pace_factor}, samples={samples}, confidence={confidence}"
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
