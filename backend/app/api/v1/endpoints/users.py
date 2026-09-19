from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.user_service import UserService
from app.schemas.user import (
    UserInterestCreate,
    UserInterestResponse,
    UserInterestsListResponse,
    UserPreferencesResponse,
    UserPreferencesUpdateRequest,
)

router = APIRouter()


@router.get(
    "/me/preferences",
    response_model=UserPreferencesResponse,
    summary="Get current user preferences",
)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    return await service.get_preferences(current_user.id)


@router.patch(
    "/me/preferences",
    response_model=UserPreferencesResponse,
    summary="Update current user preferences",
)
async def update_preferences(
    req: UserPreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    return await service.update_preferences(current_user.id, req)


@router.get(
    "/me/interests",
    response_model=UserInterestsListResponse,
    summary="List protected personal interests",
)
async def list_interests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    interests = await service.list_interests(current_user.id)
    return UserInterestsListResponse(interests=interests)


@router.post(
    "/me/interests",
    response_model=UserInterestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a protected personal interest",
)
async def create_interest(
    req: UserInterestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    return await service.create_interest(current_user.id, req)


@router.delete(
    "/me/interests/{interest_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a protected personal interest",
)
async def delete_interest(
    interest_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    await service.delete_interest(current_user.id, interest_id)
    return None
