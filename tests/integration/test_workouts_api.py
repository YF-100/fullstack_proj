import pytest
from fastapi import status


def test_create_workout(client, auth_headers):
    """Test creating a workout session"""
    response = client.post(
        "/api/workouts",
        headers=auth_headers,
        json={
            "title": "Monday Workout",
            "exercises": [
                {
                    "name": "Bench Press",
                    "sets": [
                        {"reps": 10, "weight": 60.0},
                        {"reps": 8, "weight": 65.0}
                    ]
                },
                {
                    "name": "Squats",
                    "sets": [
                        {"reps": 12, "weight": 80.0}
                    ]
                }
            ]
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Monday Workout"
    assert len(data["exercises"]) == 2
    assert data["exercises"][0]["name"] == "Bench Press"
    assert len(data["exercises"][0]["sets"]) == 2


def test_create_workout_unauthorized(client):
    """Test creating workout without authentication"""
    response = client.post(
        "/api/workouts",
        json={"title": "Test Workout", "exercises": []}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_list_workouts(client, auth_headers):
    """Test listing all workouts"""
    # Create some workouts
    client.post(
        "/api/workouts",
        headers=auth_headers,
        json={"title": "Workout 1", "exercises": []}
    )
    client.post(
        "/api/workouts",
        headers=auth_headers,
        json={"title": "Workout 2", "exercises": []}
    )
    
    # List workouts
    response = client.get("/api/workouts", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 2


def test_get_workout(client, auth_headers):
    """Test getting a specific workout"""
    # Create workout
    create_response = client.post(
        "/api/workouts",
        headers=auth_headers,
        json={
            "title": "Test Workout",
            "exercises": [
                {
                    "name": "Push-ups",
                    "sets": [{"reps": 20, "weight": 0.0}]
                }
            ]
        }
    )
    workout_id = create_response.json()["id"]
    
    # Get workout
    response = client.get(f"/api/workouts/{workout_id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == workout_id
    assert data["title"] == "Test Workout"


def test_get_nonexistent_workout(client, auth_headers):
    """Test getting a nonexistent workout"""
    response = client.get("/api/workouts/99999", headers=auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_workout(client, auth_headers):
    """Test updating a workout"""
    # Create workout
    create_response = client.post(
        "/api/workouts",
        headers=auth_headers,
        json={"title": "Original Title", "exercises": []}
    )
    workout_id = create_response.json()["id"]
    
    # Update workout
    response = client.put(
        f"/api/workouts/{workout_id}",
        headers=auth_headers,
        json={"title": "Updated Title"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Title"


def test_delete_workout(client, auth_headers):
    """Test deleting a workout"""
    # Create workout
    create_response = client.post(
        "/api/workouts",
        headers=auth_headers,
        json={"title": "To Delete", "exercises": []}
    )
    workout_id = create_response.json()["id"]
    
    # Delete workout
    response = client.delete(f"/api/workouts/{workout_id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify deletion
    response = client.get(f"/api/workouts/{workout_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_add_exercise_to_workout(client, auth_headers):
    """Test adding an exercise to a workout"""
    # Create workout
    create_response = client.post(
        "/api/workouts",
        headers=auth_headers,
        json={"title": "Test Workout", "exercises": []}
    )
    workout_id = create_response.json()["id"]
    
    # Add exercise
    response = client.post(
        f"/api/workouts/{workout_id}/exercises",
        headers=auth_headers,
        json={
            "name": "Pull-ups",
            "sets": [
                {"reps": 10, "weight": 0.0},
                {"reps": 8, "weight": 0.0}
            ]
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Pull-ups"
    assert len(data["sets"]) == 2


def test_delete_exercise(client, auth_headers):
    """Test deleting an exercise"""
    # Create workout with exercise
    create_response = client.post(
        "/api/workouts",
        headers=auth_headers,
        json={
            "title": "Test Workout",
            "exercises": [
                {
                    "name": "To Delete",
                    "sets": [{"reps": 10, "weight": 50.0}]
                }
            ]
        }
    )
    exercise_id = create_response.json()["exercises"][0]["id"]
    
    # Delete exercise
    response = client.delete(f"/api/workouts/exercises/{exercise_id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
