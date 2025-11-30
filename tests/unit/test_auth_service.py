import pytest
from app.services.auth import hash_password, verify_password, create_access_token, decode_access_token


def test_hash_password():
    """Test password hashing"""
    password = "testpassword123"
    hashed = hash_password(password)
    
    # Check hash format
    assert hashed.startswith("pbkdf2_sha256$")
    parts = hashed.split("$")
    assert len(parts) == 4
    assert parts[0] == "pbkdf2_sha256"
    assert int(parts[1]) > 0  # iterations
    assert len(parts[2]) > 0  # salt
    assert len(parts[3]) > 0  # hash


def test_verify_password():
    """Test password verification"""
    password = "testpassword123"
    hashed = hash_password(password)
    
    # Correct password
    assert verify_password(password, hashed) is True
    
    # Incorrect password
    assert verify_password("wrongpassword", hashed) is False


def test_verify_password_invalid_format():
    """Test password verification with invalid hash format"""
    password = "testpassword123"
    invalid_hash = "invalid_hash_format"
    
    assert verify_password(password, invalid_hash) is False


def test_create_access_token():
    """Test JWT token creation"""
    data = {"sub": "testuser"}
    token = create_access_token(data)
    
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_access_token():
    """Test JWT token decoding"""
    username = "testuser"
    data = {"sub": username}
    token = create_access_token(data)
    
    decoded = decode_access_token(token)
    
    assert decoded is not None
    assert decoded.username == username


def test_decode_invalid_token():
    """Test decoding invalid JWT token"""
    invalid_token = "invalid.jwt.token"
    
    decoded = decode_access_token(invalid_token)
    
    assert decoded is None
