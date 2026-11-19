
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.models.user import User

from app.database import get_db
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
)
from app.controllers.auth_controller import (
    register_controller,
    login_controller,
    get_me_controller,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Register a new customer or provider.
    """
    return register_controller(
        user_data=user_data,
        db=db,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Log in and receive a JWT access token.
    """
    return login_controller(
        login_data=login_data,
        db=db,
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return get_me_controller(current_user=current_user)

