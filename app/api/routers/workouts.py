from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.workouts import (
    WorkoutSession,
    WorkoutSessionCreate,
    WorkoutSessionUpdate,
    WorkoutSessionList,
    Exercise,
    ExerciseCreate,
)
from app.db.models import User
from app.services.workouts import (
    create_workout_session,
    get_workout_session,
    get_user_workouts,
    update_workout_session,
    delete_workout_session,
    add_exercise_to_workout,
    delete_exercise,
)


router = APIRouter(prefix="/api/workouts", tags=["workouts"])


@router.post("", response_model=WorkoutSession, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout_data: WorkoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new workout session with exercises and sets.
    
    Args:
        workout_data: Workout session data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created workout session
    """
    workout = create_workout_session(
        db=db,
        workout_data=workout_data,
        user_id=current_user.id
    )
    return workout


@router.get("", response_model=List[WorkoutSession])
async def list_workouts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all workout sessions for the current user.
    
    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of workout sessions
    """
    workouts = get_user_workouts(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return workouts


@router.get("/{workout_id}", response_model=WorkoutSession)
async def get_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific workout session by ID.
    
    Args:
        workout_id: Workout session ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Workout session details
        
    Raises:
        HTTPException: If workout not found or doesn't belong to user
    """
    workout = get_workout_session(
        db=db,
        workout_id=workout_id,
        user_id=current_user.id
    )
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return workout


@router.put("/{workout_id}", response_model=WorkoutSession)
async def update_workout(
    workout_id: int,
    workout_data: WorkoutSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a workout session.
    
    Args:
        workout_id: Workout session ID
        workout_data: Updated workout data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated workout session
        
    Raises:
        HTTPException: If workout not found or doesn't belong to user
    """
    workout = update_workout_session(
        db=db,
        workout_id=workout_id,
        workout_data=workout_data,
        user_id=current_user.id
    )
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return workout


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a workout session.
    
    Args:
        workout_id: Workout session ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If workout not found or doesn't belong to user
    """
    success = delete_workout_session(
        db=db,
        workout_id=workout_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return None


@router.post("/{workout_id}/exercises", response_model=Exercise, status_code=status.HTTP_201_CREATED)
async def add_exercise(
    workout_id: int,
    exercise_data: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add an exercise to a workout session.
    
    Args:
        workout_id: Workout session ID
        exercise_data: Exercise data with sets
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created exercise
        
    Raises:
        HTTPException: If workout not found or doesn't belong to user
    """
    exercise = add_exercise_to_workout(
        db=db,
        workout_id=workout_id,
        exercise_data=exercise_data,
        user_id=current_user.id
    )
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return exercise


@router.delete("/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_exercise(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an exercise from a workout session.
    
    Args:
        exercise_id: Exercise ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If exercise not found or doesn't belong to user
    """
    success = delete_exercise(
        db=db,
        exercise_id=exercise_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    return None


@router.patch("/{workout_id}/exercises/{exercise_id}/complete", response_model=WorkoutSession)
async def toggle_exercise_completion(
    workout_id: int,
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle exercise completion status and check if workout is complete"""
    from app.db.models import WorkoutSession as WorkoutModel, Exercise as ExerciseModel
    from datetime import datetime
    
    # Get workout and verify ownership
    workout = db.query(WorkoutModel).filter(
        WorkoutModel.id == workout_id,
        WorkoutModel.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    # Get exercise and verify it belongs to this workout
    exercise = db.query(ExerciseModel).filter(
        ExerciseModel.id == exercise_id,
        ExerciseModel.session_id == workout_id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    # Toggle exercise completion
    exercise.is_completed = not exercise.is_completed
    
    # Check if all exercises are completed
    all_completed = all(ex.is_completed for ex in workout.exercises)
    
    if all_completed and not workout.is_completed:
        workout.is_completed = True
        workout.completed_at = datetime.now()
    elif not all_completed and workout.is_completed:
        workout.is_completed = False
        workout.completed_at = None
    
    db.commit()
    db.refresh(workout)
    
    return workout


@router.patch("/{workout_id}/complete", response_model=WorkoutSession)
async def mark_workout_complete(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all exercises and workout as complete"""
    from app.db.models import WorkoutSession as WorkoutModel
    from datetime import datetime
    
    workout = db.query(WorkoutModel).filter(
        WorkoutModel.id == workout_id,
        WorkoutModel.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    # Mark all exercises as completed
    for exercise in workout.exercises:
        exercise.is_completed = True
    
    # Mark workout as completed
    workout.is_completed = True
    workout.completed_at = datetime.now()
    
    db.commit()
    db.refresh(workout)
    
    return workout
