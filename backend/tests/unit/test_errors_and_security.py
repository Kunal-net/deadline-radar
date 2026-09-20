import pytest
from app.core.errors import (
    AppException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing():
    raw_pwd = "SecurePassword123!"
    hashed = get_password_hash(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation_and_decoding():
    payload = {"sub": "usr_test_123", "email": "test@example.com"}
    token = create_access_token(payload)
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "usr_test_123"
    assert decoded["email"] == "test@example.com"
    assert "exp" in decoded


def test_invalid_jwt_token():
    with pytest.raises(UnauthorizedException) as exc_info:
        decode_access_token("invalid.token.payload")
    assert exc_info.value.code == "INVALID_TOKEN"


def test_expired_jwt_token():
    from datetime import timedelta
    payload = {"sub": "usr_test_123", "email": "test@example.com"}
    expired_token = create_access_token(payload, expires_delta=timedelta(seconds=-10))
    with pytest.raises(UnauthorizedException) as exc_info:
        decode_access_token(expired_token)
    assert exc_info.value.code == "EXPIRED_TOKEN"
    assert exc_info.value.status_code == 401


def test_custom_app_exceptions():
    nf = NotFoundException("Item wi_123 not found", code="ITEM_NOT_FOUND")
    assert nf.status_code == 404
    assert nf.code == "ITEM_NOT_FOUND"

    cf = ConflictException("Session active", code="ACTIVE_SESSION")
    assert cf.status_code == 409
    assert cf.code == "ACTIVE_SESSION"
