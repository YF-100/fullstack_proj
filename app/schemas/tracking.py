from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class SleepLogBase(BaseModel):
    date: date
    hours: float = Field(ge=0, le=24, description="Hours of sleep")
    quality: int = Field(ge=1, le=5, description="Sleep quality rating 1-5")
    notes: Optional[str] = None


class SleepLogCreate(SleepLogBase):
    pass


class SleepLogUpdate(BaseModel):
    hours: Optional[float] = Field(None, ge=0, le=24)
    quality: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class SleepLog(SleepLogBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class NutritionLogBase(BaseModel):
    date: date
    calories: int = Field(ge=0, description="Total calories consumed")
    protein: float = Field(ge=0, description="Protein in grams")
    carbs: Optional[float] = Field(None, ge=0, description="Carbohydrates in grams")
    fats: Optional[float] = Field(None, ge=0, description="Fats in grams")
    water: Optional[float] = Field(None, ge=0, description="Water in liters")
    notes: Optional[str] = None


class NutritionLogCreate(NutritionLogBase):
    pass


class NutritionLogUpdate(BaseModel):
    calories: Optional[int] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)
    carbs: Optional[float] = Field(None, ge=0)
    fats: Optional[float] = Field(None, ge=0)
    water: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class NutritionLog(NutritionLogBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
