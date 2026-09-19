from __future__ import annotations

from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.common import AppBaseModel


class UserRegisterRequest(AppBaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=255)
    timezone: str = Field(default="UTC", max_length=64)


class UserLoginRequest(AppBaseModel):
    email: EmailStr
    password: str


class TokenResponse(AppBaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800


class UserProfileResponse(AppBaseModel):
    id: str
    email: str
    full_name: str
    timezone: str = "UTC"
    created_at: str


class RegisterResponse(AppBaseModel):
    user: UserProfileResponse
    tokens: TokenResponse
