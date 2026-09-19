from __future__ import annotations

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    PROJECT_NAME: str = "Deadline Radar"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Database
    # Default to local SQLite async for immediate standalone zero-dependency run,
    # seamlessly overrides via DATABASE_URL=postgresql+asyncpg://user:pass@host/db
    DATABASE_URL: str = "sqlite+aiosqlite:///./deadline_radar.db"

    # Security
    SECRET_KEY: str = "deadlineradar_super_secret_dev_key_change_in_production_32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # AI Configuration
    AI_PROVIDER: str = "mock"  # "gemini" | "claude" | "mock"
    GEMINI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    AI_TIMEOUT_SECONDS: float = 15.0

    # Rate Limiting
    RATE_LIMIT_GENERAL_PER_MINUTE: int = 100
    RATE_LIMIT_AI_PER_MINUTE: int = 10


settings = Settings()
