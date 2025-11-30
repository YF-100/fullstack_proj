from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.db.database import get_db
from app.db.models import User, SleepLog, NutritionLog
from app.schemas.tracking import (
    SleepLogCreate, SleepLogUpdate, SleepLog as SleepLogSchema,
    NutritionLogCreate, NutritionLogUpdate, NutritionLog as NutritionLogSchema
)
from app.api.deps import get_current_user

router = APIRouter()


# Sleep Tracking Endpoints

@router.post("/sleep", response_model=SleepLogSchema, status_code=status.HTTP_201_CREATED)
async def create_sleep_log(
    sleep_data: SleepLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new sleep log entry"""
    # Check if entry already exists for this date
    existing_log = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id,
        SleepLog.date == sleep_data.date
    ).first()
    
    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sleep log already exists for this date"
        )
    
    new_log = SleepLog(**sleep_data.model_dump(), user_id=current_user.id)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.get("/sleep", response_model=List[SleepLogSchema])
async def get_sleep_logs(
    skip: int = 0,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sleep logs for current user"""
    logs = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id
    ).order_by(SleepLog.date.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/sleep/{log_id}", response_model=SleepLogSchema)
async def get_sleep_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific sleep log"""
    log = db.query(SleepLog).filter(
        SleepLog.id == log_id,
        SleepLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep log not found"
        )
    return log


@router.put("/sleep/{log_id}", response_model=SleepLogSchema)
async def update_sleep_log(
    log_id: int,
    sleep_data: SleepLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a sleep log"""
    log = db.query(SleepLog).filter(
        SleepLog.id == log_id,
        SleepLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep log not found"
        )
    
    update_data = sleep_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)
    
    db.commit()
    db.refresh(log)
    return log


@router.delete("/sleep/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sleep_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a sleep log"""
    log = db.query(SleepLog).filter(
        SleepLog.id == log_id,
        SleepLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep log not found"
        )
    
    db.delete(log)
    db.commit()


# Nutrition Tracking Endpoints

@router.post("/nutrition", response_model=NutritionLogSchema, status_code=status.HTTP_201_CREATED)
def create_nutrition_log(
    nutrition_data: NutritionLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new nutrition log entry"""
    # Check if entry already exists for this date
    existing_log = db.query(NutritionLog).filter(
        NutritionLog.user_id == current_user.id,
        NutritionLog.date == nutrition_data.date
    ).first()
    
    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nutrition log already exists for this date"
        )
    
    new_log = NutritionLog(**nutrition_data.model_dump(), user_id=current_user.id)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.get("/nutrition", response_model=List[NutritionLogSchema])
def get_nutrition_logs(
    skip: int = 0,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all nutrition logs for current user"""
    logs = db.query(NutritionLog).filter(
        NutritionLog.user_id == current_user.id
    ).order_by(NutritionLog.date.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/nutrition/{log_id}", response_model=NutritionLogSchema)
def get_nutrition_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific nutrition log"""
    log = db.query(NutritionLog).filter(
        NutritionLog.id == log_id,
        NutritionLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutrition log not found"
        )
    return log


@router.put("/nutrition/{log_id}", response_model=NutritionLogSchema)
def update_nutrition_log(
    log_id: int,
    nutrition_data: NutritionLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a nutrition log"""
    log = db.query(NutritionLog).filter(
        NutritionLog.id == log_id,
        NutritionLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutrition log not found"
        )
    
    update_data = nutrition_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)
    
    db.commit()
    db.refresh(log)
    return log


@router.delete("/nutrition/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nutrition_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a nutrition log"""
    log = db.query(NutritionLog).filter(
        NutritionLog.id == log_id,
        NutritionLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutrition log not found"
        )
    
    db.delete(log)
    db.commit()
