from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    """User model for authentication and user management"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Hashed password
    
    # Personal stats
    age = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)  # in cm
    weight = Column(Float, nullable=True)  # in kg
    gender = Column(String, nullable=True)  # Male, Female, Other
    fitness_goal = Column(String, nullable=True)  # Weight Loss, Muscle Gain, General Fitness, etc.
    
    # Relationships
    workouts = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    sleep_logs = relationship("SleepLog", back_populates="user", cascade="all, delete-orphan")
    nutrition_logs = relationship("NutritionLog", back_populates="user", cascade="all, delete-orphan")


class WorkoutSession(Base):
    """WorkoutSession model for tracking workout sessions"""
    
    __tablename__ = "workout_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="workouts")
    exercises = relationship("Exercise", back_populates="session", cascade="all, delete-orphan")


class Exercise(Base):
    """Exercise model for tracking exercises within a workout session"""
    
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    session = relationship("WorkoutSession", back_populates="exercises")
    sets = relationship("WorkoutSet", back_populates="exercise", cascade="all, delete-orphan")


class WorkoutSet(Base):
    """WorkoutSet model for tracking individual sets within an exercise"""
    
    __tablename__ = "workout_sets"
    
    id = Column(Integer, primary_key=True, index=True)
    reps = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    
    # Relationships
    exercise = relationship("Exercise", back_populates="sets")


class SleepLog(Base):
    """SleepLog model for tracking daily sleep"""
    
    __tablename__ = "sleep_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    hours = Column(Float, nullable=False)
    quality = Column(Integer, nullable=False)  # 1-5 rating
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="sleep_logs")


class NutritionLog(Base):
    """NutritionLog model for tracking daily nutrition"""
    
    __tablename__ = "nutrition_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    calories = Column(Integer, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=True)
    fats = Column(Float, nullable=True)
    water = Column(Float, nullable=True)  # in liters
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="nutrition_logs")
