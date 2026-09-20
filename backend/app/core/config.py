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
    AI_PROVIDER: str = "mock"  # "groq" | "gemini" | "claude" | "mock"
    # Groq (primary)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "groq/compound"  # Also: llama-3.3-70b-versatile, llama-3.1-8b-instant
    # Gemini (legacy, retained for backward compatibility)
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None  # Standard alias for Google Gemini API key
    GEMINI_MODEL: str = "gemini-1.5-flash"
    # Anthropic Claude
    ANTHROPIC_API_KEY: Optional[str] = None
    AI_TIMEOUT_SECONDS: float = 15.0

    @property
    def effective_groq_api_key(self) -> Optional[str]:
        return self.GROQ_API_KEY

    @property
    def is_groq_configured(self) -> bool:
        return bool(self.GROQ_API_KEY)

    @property
    def effective_gemini_api_key(self) -> Optional[str]:
        return self.GEMINI_API_KEY or self.GOOGLE_API_KEY

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.effective_gemini_api_key)

    # Rate Limiting
    RATE_LIMIT_GENERAL_PER_MINUTE: int = 100
    RATE_LIMIT_AI_PER_MINUTE: int = 10


settings = Settings()
