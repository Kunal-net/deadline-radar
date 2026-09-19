from __future__ import annotations

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    availability,
    health,
    tracking,
    users,
    work,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Preferences"])
api_router.include_router(work.router, prefix="/work", tags=["Work Management"])
api_router.include_router(availability.router, prefix="/availability", tags=["Time Availability"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["Time Tracking"])
