from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.user.schemas import UserCreate, UserLogin, UserResponse, Token
from app.domains.user.service import UserService
from app.api.deps import get_current_user
from app.domains.user.models import User
from app.core.security import create_access_token

router = APIRouter()

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(schema: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return a JWT access token."""
    service = UserService(db)
    user = service.register_user(schema)
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(schema: UserLogin, db: Session = Depends(get_db)):
    """Authenticate credentials and return a JWT access token."""
    service = UserService(db)
    user = service.authenticate_user(schema)
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile information."""
    return current_user
