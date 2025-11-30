from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.users import User, UserUpdate
from app.db.models import User as UserModel
from app.services.auth import hash_password, get_user_by_username, get_user_by_email


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user from JWT token
        
    Returns:
        Current user object
    """
    return current_user


@router.put("/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user information.
    
    Args:
        user_update: User update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user object
        
    Raises:
        HTTPException: If username or email already taken by another user
    """
    # Check if username is being changed and if it's already taken
    if user_update.username and user_update.username != current_user.username:
        existing_user = get_user_by_username(db, username=user_update.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username
    
    # Check if email is being changed and if it's already taken
    if user_update.email and user_update.email != current_user.email:
        existing_email = get_user_by_email(db, email=user_update.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
        current_user.email = user_update.email
    
    # Update password if provided
    if user_update.password:
        current_user.password = hash_password(user_update.password)
    
    # Update personal stats if provided
    if user_update.age is not None:
        current_user.age = user_update.age
    if user_update.height is not None:
        current_user.height = user_update.height
    if user_update.weight is not None:
        current_user.weight = user_update.weight
    if user_update.gender is not None:
        current_user.gender = user_update.gender
    if user_update.fitness_goal is not None:
        current_user.fitness_goal = user_update.fitness_goal
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_me(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user account.
    
    Args:
        current_user: Current authenticated user
        db: Database session
    """
    db.delete(current_user)
    db.commit()
    
    return None
