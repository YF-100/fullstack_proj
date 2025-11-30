import pytest
from app.services.workouts import (
    create_workout_session,
    get_workout_session,
    get_user_workouts,
    update_workout_session,
    delete_workout_session,
)
from app.schemas.workouts import WorkoutSessionCreate, WorkoutSessionUpdate, ExerciseCreate, WorkoutSetCreate
from app.services.auth import create_user


def test_create_workout_session(db):
    """Test creating a workout session"""
    # Create test user
    user = create_user(db, "testuser", "test@example.com", "password123")
    
    # Create workout data
    workout_data = WorkoutSessionCreate(
        title="Morning Workout",
        exercises=[
            ExerciseCreate(
                name="Bench Press",
                sets=[
                    WorkoutSetCreate(reps=10, weight=60.0),
                    WorkoutSetCreate(reps=8, weight=65.0),
                ]
            )
        ]
    )
    
    # Create workout
    workout = create_workout_session(db, workout_data, user.id)
    
    assert workout.id is not None
    assert workout.title == "Morning Workout"
    assert workout.user_id == user.id
    assert len(workout.exercises) == 1
    assert workout.exercises[0].name == "Bench Press"
    assert len(workout.exercises[0].sets) == 2


def test_get_workout_session(db):
    """Test getting a workout session"""
    # Create test user and workout
    user = create_user(db, "testuser", "test@example.com", "password123")
    workout_data = WorkoutSessionCreate(title="Test Workout", exercises=[])
    workout = create_workout_session(db, workout_data, user.id)
    
    # Get workout
    retrieved = get_workout_session(db, workout.id, user.id)
    
    assert retrieved is not None
    assert retrieved.id == workout.id
    assert retrieved.title == "Test Workout"


def test_get_workout_session_wrong_user(db):
    """Test getting a workout session with wrong user"""
    # Create two users
    user1 = create_user(db, "user1", "user1@example.com", "password123")
    user2 = create_user(db, "user2", "user2@example.com", "password123")
    
    # Create workout for user1
    workout_data = WorkoutSessionCreate(title="User1 Workout", exercises=[])
    workout = create_workout_session(db, workout_data, user1.id)
    
    # Try to get with user2
    retrieved = get_workout_session(db, workout.id, user2.id)
    
    assert retrieved is None


def test_get_user_workouts(db):
    """Test getting all workouts for a user"""
    # Create test user
    user = create_user(db, "testuser", "test@example.com", "password123")
    
    # Create multiple workouts
    workout_data1 = WorkoutSessionCreate(title="Workout 1", exercises=[])
    workout_data2 = WorkoutSessionCreate(title="Workout 2", exercises=[])
    
    create_workout_session(db, workout_data1, user.id)
    create_workout_session(db, workout_data2, user.id)
    
    # Get workouts
    workouts = get_user_workouts(db, user.id)
    
    assert len(workouts) == 2


def test_update_workout_session(db):
    """Test updating a workout session"""
    # Create test user and workout
    user = create_user(db, "testuser", "test@example.com", "password123")
    workout_data = WorkoutSessionCreate(title="Original Title", exercises=[])
    workout = create_workout_session(db, workout_data, user.id)
    
    # Update workout
    update_data = WorkoutSessionUpdate(title="Updated Title")
    updated = update_workout_session(db, workout.id, update_data, user.id)
    
    assert updated is not None
    assert updated.title == "Updated Title"


def test_delete_workout_session(db):
    """Test deleting a workout session"""
    # Create test user and workout
    user = create_user(db, "testuser", "test@example.com", "password123")
    workout_data = WorkoutSessionCreate(title="To Delete", exercises=[])
    workout = create_workout_session(db, workout_data, user.id)
    
    # Delete workout
    success = delete_workout_session(db, workout.id, user.id)
    
    assert success is True
    
    # Verify deletion
    retrieved = get_workout_session(db, workout.id, user.id)
    assert retrieved is None
