from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppException(Exception):
    def __init__(
        self,
        message: str,
        code: str = "BAD_REQUEST",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[List[Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", code: str = "NOT_FOUND"):
        super().__init__(message=message, code=code, status_code=status.HTTP_404_NOT_FOUND)


class ConflictException(AppException):
    def __init__(self, message: str = "Resource conflict", code: str = "CONFLICT"):
        super().__init__(message=message, code=code, status_code=status.HTTP_409_CONFLICT)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized", code: str = "UNAUTHORIZED"):
        super().__init__(message=message, code=code, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden", code: str = "FORBIDDEN"):
        super().__init__(message=message, code=code, status_code=status.HTTP_403_FORBIDDEN)


class AIConfigurationException(AppException):
    def __init__(
        self,
        message: str = "AI provider is not configured. Missing API key or configuration.",
        code: str = "AI_CONFIG_ERROR",
    ):
        super().__init__(message=message, code=code, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIServiceUnavailableException(AppException):
    def __init__(
        self,
        message: str = "AI provider service is temporarily unavailable. Please retry shortly.",
        code: str = "AI_SERVICE_UNAVAILABLE",
    ):
        super().__init__(message=message, code=code, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)


class AIRateLimitException(AppException):
    def __init__(
        self,
        message: str = "AI provider rate limit reached. Please wait a moment before retrying.",
        code: str = "AI_RATE_LIMIT",
    ):
        super().__init__(message=message, code=code, status_code=status.HTTP_429_TOO_MANY_REQUESTS)


class AITimeoutException(AppException):
    def __init__(
        self,
        message: str = "AI provider request timed out. Please retry.",
        code: str = "AI_TIMEOUT",
    ):
        super().__init__(message=message, code=code, status_code=status.HTTP_504_GATEWAY_TIMEOUT)


class AIValidationException(AppException):
    def __init__(
        self,
        message: str = "AI provider returned an invalid or unparseable structured response.",
        code: str = "AI_MALFORMED_RESPONSE",
    ):
        super().__init__(message=message, code=code, status_code=status.HTTP_502_BAD_GATEWAY)


def make_error_response(
    status_code: int,
    code: str,
    message: str,
    details: Optional[List[Any]] = None,
) -> JSONResponse:
    now_utc = datetime.now(timezone.utc).isoformat()
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": details or [],
                "timestamp": now_utc,
            }
        },
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        return make_error_response(
            status_code=exc.status_code,
            code=exc.code,
            message=exc.message,
            details=exc.details,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = "HTTP_ERROR"
        if exc.status_code == 401:
            code = "UNAUTHORIZED"
        elif exc.status_code == 403:
            code = "FORBIDDEN"
        elif exc.status_code == 404:
            code = "NOT_FOUND"
        elif exc.status_code == 409:
            code = "CONFLICT"
        return make_error_response(
            status_code=exc.status_code,
            code=code,
            message=str(exc.detail),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = []
        for error in exc.errors():
            loc = " -> ".join(str(item) for item in error.get("loc", []))
            details.append({"location": loc, "msg": error.get("msg"), "type": error.get("type")})

        return make_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message="Request validation failed",
            details=details,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return make_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred",
        )
