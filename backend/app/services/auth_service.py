
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.user import User
from app.models.customer import Customer
from app.models.provider import Provider

from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


def register_user(
    db: Session,
    user_data: RegisterRequest,
) -> AuthResponse:
    """
    Register a customer or provider.

    Creates the user and corresponding profile in one transaction.
    """

    normalized_email = str(user_data.email).strip().lower()

    # Check whether the email is already registered.
    existing_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create the user record.
    new_user = User(
        full_name=user_data.full_name,
        email=normalized_email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        role=user_data.role,
        account_status="active",
    )

    try:
        db.add(new_user)

        # Obtain the generated user_id before creating the profile.
        db.flush()

        if user_data.role == "customer":
            customer_profile = Customer(
                customer_id=new_user.user_id,
            )
            db.add(customer_profile)

        elif user_data.role == "provider":
            provider_profile = Provider(
                provider_id=new_user.user_id,
                approval_status="pending",
            )
            db.add(provider_profile)

        # Save the user and profile together.
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to register this account. "
                   "The email may already be registered.",
        ) from None

    except Exception:
        db.rollback()
        raise

    # Generate a token only after registration succeeds.
    access_token = create_access_token(
        subject=new_user.user_id,
        extra_claims={"role": new_user.role},
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


def authenticate_user(
    db: Session,
    login_data: LoginRequest,
) -> AuthResponse:
    """
    Authenticate a user and return a JWT access token.
    """

    normalized_email = str(login_data.email).strip().lower()

    user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    # Use a generic message to avoid revealing whether
    # an email address is registered.
    if user is None or not verify_password(
        login_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not active",
        )

    access_token = create_access_token(
        subject=user.user_id,
        extra_claims={"role": user.role},
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )
