from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class WorkoutSetBase(BaseModel):
    """Base schema for workout set"""
    reps: int = Field(..., gt=0, description="Number of repetitions")
    weight: float = Field(..., ge=0, description="Weight in kg")


class WorkoutSetCreate(WorkoutSetBase):
    """Schema for creating a workout set"""
    pass


class WorkoutSetUpdate(BaseModel):
    """Schema for updating a workout set"""
    reps: Optional[int] = Field(None, gt=0, description="Number of repetitions")
    weight: Optional[float] = Field(None, ge=0, description="Weight in kg")


class WorkoutSet(WorkoutSetBase):
    """Schema for workout set response"""
    id: int
    exercise_id: int
    
    class Config:
        from_attributes = True


class ExerciseBase(BaseModel):
    """Base schema for exercise"""
    name: str = Field(..., min_length=1, max_length=100)


class ExerciseCreate(ExerciseBase):
    """Schema for creating an exercise"""
    sets: List[WorkoutSetCreate] = Field(default_factory=list)


class ExerciseUpdate(BaseModel):
    """Schema for updating an exercise"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)


class Exercise(ExerciseBase):
    """Schema for exercise response"""
    id: int
    session_id: int
    is_completed: bool = False
    sets: List[WorkoutSet] = []
    
    class Config:
        from_attributes = True


class WorkoutSessionBase(BaseModel):
    """Base schema for workout session"""
    title: str = Field(..., min_length=1, max_length=200)


class WorkoutSessionCreate(WorkoutSessionBase):
    """Schema for creating a workout session"""
    exercises: List[ExerciseCreate] = Field(default_factory=list)


class WorkoutSessionUpdate(BaseModel):
    """Schema for updating a workout session"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)


class WorkoutSession(WorkoutSessionBase):
    """Schema for workout session response"""
    id: int
    date: datetime
    user_id: int
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    exercises: List[Exercise] = []
    
    class Config:
        from_attributes = True


class WorkoutSessionList(BaseModel):
    """Schema for listing workout sessions (without exercises)"""
    id: int
    date: datetime
    title: str
    user_id: int
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    exercise_count: int = 0
    
    class Config:
        from_attributes = True
