from __future__ import annotations

from typing import Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import ConflictException, UnauthorizedException
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.availability import TimeAvailability
from app.models.preference import UserPreference
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import (
    RegisterResponse,
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, req: UserRegisterRequest) -> RegisterResponse:
        existing = await self.user_repo.get_by_email(req.email)
        if existing:
            raise ConflictException(
                message=f"User with email '{req.email}' already exists.",
                code="EMAIL_ALREADY_EXISTS",
            )

        hashed_pwd = get_password_hash(req.password)
        user = User(
            email=req.email.strip().lower(),
            hashed_password=hashed_pwd,
            full_name=req.full_name.strip(),
        )
        await self.user_repo.create(user)

        # Seed default preferences
        pref = UserPreference(
            user_id=user.id,
            timezone=req.timezone,
            daily_focus_capacity_hours=4.0,
            buffer_percentage=20.0,
            preferred_work_chunk_minutes=90,
            min_break_minutes=15,
        )
        self.db.add(pref)

        # Seed default recurring weekly availability slots (0=Sunday .. 6=Saturday)
        # Weekdays: 18:00 - 22:00 (4h)
        for day in range(1, 6):
            self.db.add(
                TimeAvailability(
                    user_id=user.id,
                    day_of_week=day,
                    start_time="18:00:00",
                    end_time="22:00:00",
                    is_available=True,
                    capacity_hours=4.0,
                )
            )
        # Weekends: 10:00 - 18:00 (8h)
        for day in [0, 6]:
            self.db.add(
                TimeAvailability(
                    user_id=user.id,
                    day_of_week=day,
                    start_time="10:00:00",
                    end_time="18:00:00",
                    is_available=True,
                    capacity_hours=8.0,
                )
            )

        await self.db.commit()

        token = create_access_token({"sub": user.id, "email": user.email})
        return RegisterResponse(
            user=UserProfileResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                timezone=pref.timezone,
                created_at=user.created_at.isoformat(),
            ),
            tokens=TokenResponse(
                access_token=token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            ),
        )

    async def login(self, req: UserLoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.hashed_password):
            raise UnauthorizedException(
                message="Invalid email or password",
                code="INVALID_CREDENTIALS",
            )

        if not user.is_active:
            raise UnauthorizedException(
                message="User account is deactivated",
                code="ACCOUNT_DEACTIVATED",
            )

        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
