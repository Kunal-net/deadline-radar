from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.schemas.auth import (
    RegisterResponse,
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    return await auth_service.register(req)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive access token",
)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    return await auth_service.login(req)


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user identity",
)
async def get_me(current_user: User = Depends(get_current_user)):
    pref_tz = current_user.preferences.timezone if current_user.preferences else "UTC"
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        timezone=pref_tz,
        created_at=current_user.created_at.isoformat(),
    )
