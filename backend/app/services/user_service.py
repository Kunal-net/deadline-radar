from __future__ import annotations

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundException
from app.models.interest import UserInterest
from app.models.preference import UserPreference
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import (
    UserInterestCreate,
    UserInterestResponse,
    UserPreferencesResponse,
    UserPreferencesUpdateRequest,
)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_preferences(self, user_id: str) -> UserPreferencesResponse:
        pref = await self.user_repo.get_preferences(user_id)
        if not pref:
            # Create default if missing
            pref = UserPreference(user_id=user_id)
            self.db.add(pref)
            await self.db.commit()

        return UserPreferencesResponse(
            id=pref.id,
            user_id=pref.user_id,
            timezone=pref.timezone,
            daily_focus_capacity_hours=pref.daily_focus_capacity_hours,
            buffer_percentage=pref.buffer_percentage,
            preferred_work_chunk_minutes=pref.preferred_work_chunk_minutes,
            min_break_minutes=pref.min_break_minutes,
            remind_risk_escalation=pref.remind_risk_escalation,
            remind_7_days=pref.remind_7_days,
            remind_3_days=pref.remind_3_days,
            remind_1_day=pref.remind_1_day,
            morning_plan_briefing=pref.morning_plan_briefing,
            briefing_time=pref.briefing_time,
            ai_assistance_enabled=pref.ai_assistance_enabled,
            theme=pref.theme,
        )

    async def update_preferences(
        self, user_id: str, req: UserPreferencesUpdateRequest
    ) -> UserPreferencesResponse:
        pref = await self.user_repo.get_preferences(user_id)
        if not pref:
            pref = UserPreference(user_id=user_id)
            self.db.add(pref)

        update_dict = req.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(pref, key, value)

        await self.db.commit()
        return await self.get_preferences(user_id)

    async def list_interests(self, user_id: str) -> List[UserInterestResponse]:
        interests = await self.user_repo.list_interests(user_id)
        return [
            UserInterestResponse(
                id=i.id,
                name=i.name,
                category=i.category,
                target_weekly_hours=i.target_weekly_hours,
                is_protected=i.is_protected,
                color_hex=i.color_hex,
            )
            for i in interests
        ]

    async def create_interest(self, user_id: str, req: UserInterestCreate) -> UserInterestResponse:
        interest = UserInterest(
            user_id=user_id,
            name=req.name,
            category=req.category,
            target_weekly_hours=req.target_weekly_hours,
            is_protected=req.is_protected,
            color_hex=req.color_hex,
        )
        self.db.add(interest)
        await self.db.commit()

        return UserInterestResponse(
            id=interest.id,
            name=interest.name,
            category=interest.category,
            target_weekly_hours=interest.target_weekly_hours,
            is_protected=interest.is_protected,
            color_hex=interest.color_hex,
        )

    async def delete_interest(self, user_id: str, interest_id: str) -> None:
        interest = await self.user_repo.get_interest_by_id(interest_id, user_id)
        if not interest:
            raise NotFoundException(
                message=f"Interest '{interest_id}' not found.",
                code="INTEREST_NOT_FOUND",
            )
        await self.db.delete(interest)
        await self.db.commit()
