import pytest
from fastapi import status


def test_get_current_user(client, auth_headers):
    """Test getting current user information"""
    response = client.get("/api/users/me", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "password" not in data


def test_get_current_user_unauthorized(client):
    """Test getting current user without authentication"""
    response = client.get("/api/users/me")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_update_user(client, auth_headers):
    """Test updating user information"""
    response = client.put(
        "/api/users/me",
        headers=auth_headers,
        json={"username": "updateduser"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "updateduser"


def test_delete_user(client, auth_headers):
    """Test deleting user account"""
    response = client.delete("/api/users/me", headers=auth_headers)
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify user can no longer access protected routes
    response = client.get("/api/users/me", headers=auth_headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
