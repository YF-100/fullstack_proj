from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.models import WorkoutSession, Exercise, WorkoutSet, User
from app.schemas.workouts import (
    WorkoutSessionCreate,
    WorkoutSessionUpdate,
    ExerciseCreate,
    WorkoutSetCreate,
)


def create_workout_session(
    db: Session, 
    workout_data: WorkoutSessionCreate, 
    user_id: int
) -> WorkoutSession:
    """
    Create a new workout session with exercises and sets.
    
    Args:
        db: Database session
        workout_data: Workout session data
        user_id: ID of the user creating the workout
        
    Returns:
        Created WorkoutSession object
    """
    # Create workout session
    db_workout = WorkoutSession(
        title=workout_data.title,
        user_id=user_id
    )
    db.add(db_workout)
    db.flush()  # Get the workout ID without committing
    
    # Create exercises and sets
    for exercise_data in workout_data.exercises:
        db_exercise = Exercise(
            name=exercise_data.name,
            session_id=db_workout.id
        )
        db.add(db_exercise)
        db.flush()  # Get the exercise ID
        
        # Create sets for this exercise
        for set_data in exercise_data.sets:
            db_set = WorkoutSet(
                reps=set_data.reps,
                weight=set_data.weight,
                exercise_id=db_exercise.id
            )
            db.add(db_set)
    
    db.commit()
    db.refresh(db_workout)
    
    return db_workout


def get_workout_session(
    db: Session, 
    workout_id: int, 
    user_id: int
) -> Optional[WorkoutSession]:
    """
    Get a workout session by ID.
    
    Args:
        db: Database session
        workout_id: Workout session ID
        user_id: ID of the user requesting the workout
        
    Returns:
        WorkoutSession object if found and belongs to user, None otherwise
    """
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == user_id
    ).first()
    
    return workout


def get_user_workouts(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[WorkoutSession]:
    """
    Get all workout sessions for a user.
    
    Args:
        db: Database session
        user_id: User ID
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of WorkoutSession objects
    """
    workouts = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id
    ).order_by(
        WorkoutSession.date.desc()
    ).offset(skip).limit(limit).all()
    
    return workouts


def update_workout_session(
    db: Session, 
    workout_id: int, 
    workout_data: WorkoutSessionUpdate, 
    user_id: int
) -> Optional[WorkoutSession]:
    """
    Update a workout session.
    
    Args:
        db: Database session
        workout_id: Workout session ID
        workout_data: Updated workout data
        user_id: ID of the user updating the workout
        
    Returns:
        Updated WorkoutSession object if found and belongs to user, None otherwise
    """
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == user_id
    ).first()
    
    if not workout:
        return None
    
    # Update fields
    if workout_data.title is not None:
        workout.title = workout_data.title
    
    db.commit()
    db.refresh(workout)
    
    return workout


def delete_workout_session(
    db: Session, 
    workout_id: int, 
    user_id: int
) -> bool:
    """
    Delete a workout session.
    
    Args:
        db: Database session
        workout_id: Workout session ID
        user_id: ID of the user deleting the workout
        
    Returns:
        True if deleted, False if not found or doesn't belong to user
    """
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == user_id
    ).first()
    
    if not workout:
        return False
    
    db.delete(workout)
    db.commit()
    
    return True


def add_exercise_to_workout(
    db: Session, 
    workout_id: int, 
    exercise_data: ExerciseCreate, 
    user_id: int
) -> Optional[Exercise]:
    """
    Add an exercise to a workout session.
    
    Args:
        db: Database session
        workout_id: Workout session ID
        exercise_data: Exercise data
        user_id: ID of the user adding the exercise
        
    Returns:
        Created Exercise object if workout found and belongs to user, None otherwise
    """
    # Verify workout belongs to user
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == user_id
    ).first()
    
    if not workout:
        return None
    
    # Create exercise
    db_exercise = Exercise(
        name=exercise_data.name,
        session_id=workout_id
    )
    db.add(db_exercise)
    db.flush()
    
    # Create sets
    for set_data in exercise_data.sets:
        db_set = WorkoutSet(
            reps=set_data.reps,
            weight=set_data.weight,
            exercise_id=db_exercise.id
        )
        db.add(db_set)
    
    db.commit()
    db.refresh(db_exercise)
    
    return db_exercise


def delete_exercise(
    db: Session, 
    exercise_id: int, 
    user_id: int
) -> bool:
    """
    Delete an exercise from a workout session.
    
    Args:
        db: Database session
        exercise_id: Exercise ID
        user_id: ID of the user deleting the exercise
        
    Returns:
        True if deleted, False if not found or doesn't belong to user
    """
    # Get exercise with workout verification
    exercise = db.query(Exercise).join(WorkoutSession).filter(
        Exercise.id == exercise_id,
        WorkoutSession.user_id == user_id
    ).first()
    
    if not exercise:
        return False
    
    db.delete(exercise)
    db.commit()
    
    return True
