"""
Integration tests for tracking API endpoints (sleep and nutrition)
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, date
from app.main import app
from app.db.models import User
from app.services.auth import hash_password

client = TestClient(app)


@pytest.fixture
def test_user_token(db):
    """Create a test user and return auth token"""
    user = User(
        username="trackuser",
        email="track@test.com",
        password=hash_password("testpass123")
    )
    db.add(user)
    db.commit()
    
    response = client.post(
        "/api/auth/login",
        data={"username": "trackuser", "password": "testpass123"}
    )
    return response.json()["access_token"]


# ============================================================================
# Sleep Log Tests
# ============================================================================

def test_create_sleep_log(test_user_token):
    """Test creating a sleep log"""
    response = client.post(
        "/api/tracking/sleep",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "hours": 7.5,
            "quality": "good",
            "notes": "Slept well"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["hours"] == 7.5
    assert data["quality"] == "good"
    assert data["notes"] == "Slept well"


def test_create_sleep_log_unauthorized():
    """Test creating sleep log without auth"""
    response = client.post(
        "/api/tracking/sleep",
        json={
            "date": str(date.today()),
            "hours": 8.0,
            "quality": "excellent"
        }
    )
    assert response.status_code == 401


def test_get_sleep_logs(test_user_token):
    """Test getting all sleep logs"""
    # Create a sleep log first
    client.post(
        "/api/tracking/sleep",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "hours": 8.0,
            "quality": "excellent"
        }
    )
    
    response = client.get(
        "/api/tracking/sleep",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["hours"] == 8.0


def test_get_sleep_log_by_id(test_user_token):
    """Test getting a specific sleep log"""
    # Create a sleep log
    create_response = client.post(
        "/api/tracking/sleep",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "hours": 7.0,
            "quality": "good"
        }
    )
    sleep_id = create_response.json()["id"]
    
    response = client.get(
        f"/api/tracking/sleep/{sleep_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == sleep_id


def test_get_nonexistent_sleep_log(test_user_token):
    """Test getting a sleep log that doesn't exist"""
    response = client.get(
        "/api/tracking/sleep/99999",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 404


def test_update_sleep_log(test_user_token):
    """Test updating a sleep log"""
    # Create a sleep log
    create_response = client.post(
        "/api/tracking/sleep",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "hours": 6.0,
            "quality": "fair"
        }
    )
    sleep_id = create_response.json()["id"]
    
    # Update it
    response = client.put(
        f"/api/tracking/sleep/{sleep_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "hours": 8.0,
            "quality": "excellent",
            "notes": "Much better sleep"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["hours"] == 8.0
    assert data["quality"] == "excellent"


def test_delete_sleep_log(test_user_token):
    """Test deleting a sleep log"""
    # Create a sleep log
    create_response = client.post(
        "/api/tracking/sleep",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "hours": 7.0,
            "quality": "good"
        }
    )
    sleep_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(
        f"/api/tracking/sleep/{sleep_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(
        f"/api/tracking/sleep/{sleep_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert get_response.status_code == 404


# ============================================================================
# Nutrition Log Tests
# ============================================================================

def test_create_nutrition_log(test_user_token):
    """Test creating a nutrition log"""
    response = client.post(
        "/api/tracking/nutrition",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "calories": 2000,
            "protein": 150,
            "carbs": 250,
            "fats": 60,
            "water": 2.5,
            "notes": "Good day"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["calories"] == 2000
    assert data["protein"] == 150
    assert data["water"] == 2.5


def test_create_nutrition_log_unauthorized():
    """Test creating nutrition log without auth"""
    response = client.post(
        "/api/tracking/nutrition",
        json={
            "date": str(date.today()),
            "calories": 2000
        }
    )
    assert response.status_code == 401


def test_get_nutrition_logs(test_user_token):
    """Test getting all nutrition logs"""
    # Create a nutrition log first
    client.post(
        "/api/tracking/nutrition",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "calories": 2200,
            "protein": 160
        }
    )
    
    response = client.get(
        "/api/tracking/nutrition",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["calories"] == 2200


def test_get_nutrition_log_by_id(test_user_token):
    """Test getting a specific nutrition log"""
    # Create a nutrition log
    create_response = client.post(
        "/api/tracking/nutrition",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "calories": 1800,
            "protein": 120
        }
    )
    nutrition_id = create_response.json()["id"]
    
    response = client.get(
        f"/api/tracking/nutrition/{nutrition_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == nutrition_id


def test_get_nonexistent_nutrition_log(test_user_token):
    """Test getting a nutrition log that doesn't exist"""
    response = client.get(
        "/api/tracking/nutrition/99999",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 404


def test_update_nutrition_log(test_user_token):
    """Test updating a nutrition log"""
    # Create a nutrition log
    create_response = client.post(
        "/api/tracking/nutrition",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "calories": 1500,
            "protein": 100
        }
    )
    nutrition_id = create_response.json()["id"]
    
    # Update it
    response = client.put(
        f"/api/tracking/nutrition/{nutrition_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "calories": 2000,
            "protein": 150,
            "notes": "Updated macros"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["calories"] == 2000
    assert data["protein"] == 150


def test_delete_nutrition_log(test_user_token):
    """Test deleting a nutrition log"""
    # Create a nutrition log
    create_response = client.post(
        "/api/tracking/nutrition",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "calories": 1800
        }
    )
    nutrition_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(
        f"/api/tracking/nutrition/{nutrition_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(
        f"/api/tracking/nutrition/{nutrition_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert get_response.status_code == 404


# ============================================================================
# Analytics Tests
# ============================================================================

def test_get_analytics(test_user_token):
    """Test getting analytics/stats"""
    # Create some data first
    client.post(
        "/api/tracking/sleep",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "hours": 8.0,
            "quality": "excellent"
        }
    )
    
    client.post(
        "/api/tracking/nutrition",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "date": str(date.today()),
            "calories": 2000,
            "protein": 150
        }
    )
    
    response = client.get(
        "/api/tracking/analytics",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    # Just verify we get a response - analytics structure depends on implementation


def test_get_analytics_unauthorized():
    """Test getting analytics without auth"""
    response = client.get("/api/tracking/analytics")
    assert response.status_code == 401
