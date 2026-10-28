
from typing import Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User


# Read the JWT from the Authorization: Bearer <token> header.
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate the JWT and return the authenticated user.

    Rejects missing/invalid tokens and users who are
    missing from the database or whose accounts are inactive.
    """

    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized_exception

    if credentials.scheme.lower() != "bearer":
        raise unauthorized_exception

    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")

        if not isinstance(subject, str) or not subject.isdigit():
            raise unauthorized_exception

        user_id = int(subject)

    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise unauthorized_exception from None

    user = db.query(User).filter(
        User.user_id == user_id
    ).first()

    if user is None:
        raise unauthorized_exception

    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not active",
        )

    return user


def require_role(*allowed_roles: str) -> Callable:
    """
    Create a dependency that permits only specified user roles.

    Example:
        Depends(require_role("admin"))
        Depends(require_role("customer", "provider"))
    """

    valid_roles = {"customer", "provider", "admin"}

    if not allowed_roles or not set(allowed_roles).issubset(valid_roles):
        raise ValueError("Invalid or missing allowed roles")

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        return current_user

    return role_checker
