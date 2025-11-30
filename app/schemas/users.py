from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserBase(BaseModel):
    """Base user schema with common attributes"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    age: Optional[int] = Field(None, ge=1, le=150)
    height: Optional[float] = Field(None, ge=50, le=300)  # cm
    weight: Optional[float] = Field(None, ge=20, le=500)  # kg
    gender: Optional[str] = Field(None, max_length=20)
    fitness_goal: Optional[str] = Field(None, max_length=100)


class UserInDB(UserBase):
    """Schema for user as stored in database"""
    id: int
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    fitness_goal: Optional[str] = None
    
    class Config:
        from_attributes = True


class User(UserInDB):
    """Schema for user response (without password)"""
    pass


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for data encoded in JWT token"""
    username: Optional[str] = None
