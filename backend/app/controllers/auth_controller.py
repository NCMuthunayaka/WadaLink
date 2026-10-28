
from sqlalchemy.orm import Session

from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
)
from app.services.auth_service import (
    register_user,
    authenticate_user,
)


def register_controller(
    user_data: RegisterRequest,
    db: Session,
) -> AuthResponse:
    """
    Register a new customer or service provider.
    """
    return register_user(
        db=db,
        user_data=user_data,
    )


def login_controller(
    login_data: LoginRequest,
    db: Session,
) -> AuthResponse:
    """
    Authenticate an existing user and return an access token.
    """
    return authenticate_user(
        db=db,
        login_data=login_data,
    )
