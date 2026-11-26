"""Profile business logic for customers and providers (M1)."""

import secrets

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.customer import Customer
from app.models.equipment import Equipment, EquipmentStatus
from app.models.equipment_reservation import EquipmentReservation, ReservationStatus
from app.models.provider import ApprovalStatus, Provider
from app.models.quotation import Quotation, QuotationStatus
from app.models.review import Review
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import AccountStatus, User, UserRole
from app.schemas.profile_schema import ProfileUpdate, ProviderProfileUpdate

DELETED_EMAIL_DOMAIN = "deleted.example.com"

_ACTIVE_REQUESTS = (RequestStatus.OPEN, RequestStatus.ASSIGNED, RequestStatus.IN_PROGRESS)
_ACTIVE_JOBS = (RequestStatus.ASSIGNED, RequestStatus.IN_PROGRESS)
_ACTIVE_RESERVATIONS = (
    ReservationStatus.PENDING,
    ReservationStatus.RESERVED,
    ReservationStatus.IN_RENT,
    ReservationStatus.RETURN_PENDING,
)


# ---------- helpers ----------

def _owner(db: Session, user: User):
    """Return (customer_profile, provider_profile); at most one is not None."""
    return db.get(Customer, user.user_id), db.get(Provider, user.user_id)


def _text(value):
    return str(value) if value is not None else None


def profile_response(user: User, customer=None, provider=None) -> dict:
    """Same response shape the profile endpoints have always returned."""
    data = {
        "userId": user.user_id,
        "name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role.value,
        "accountStatus": user.account_status.value,
    }
    owner = customer or provider
    if owner:
        data.update(
            {
                "address": getattr(owner, "address", None),
                "latitude": _text(owner.latitude),
                "longitude": _text(owner.longitude),
            }
        )
    if provider:
        data.update(
            {
                "businessName": provider.business_name,
                "bio": provider.bio,
                "experienceYears": provider.experience_years,
                "hourlyRate": float(provider.hourly_rate) if provider.hourly_rate is not None else None,
                "serviceRadiusKm": float(provider.service_radius_km),
                "approvalStatus": provider.approval_status.value,
            }
        )
    return data


def _category_item(category: ServiceCategory) -> dict:
    # Same shape as GET /requests/categories
    return {
        "id": str(category.category_id),
        "name": category.category_name,
        "description": category.description,
    }


# ---------- profile read / update ----------

def get_profile(db: Session, user: User) -> dict:
    customer, provider = _owner(db, user)
    return profile_response(user, customer, provider)


def update_profile(db: Session, user: User, payload: ProfileUpdate) -> dict:
    """Partial update: only fields present in the request body are changed."""
    data = payload.model_dump(exclude_unset=True)
    customer, provider = _owner(db, user)

    if "full_name" in data:
        user.full_name = data["full_name"]
    if "phone" in data:
        user.phone = data["phone"]

    owner = customer or provider
    if owner is not None:
        for field in ("latitude", "longitude"):
            if field in data:
                setattr(owner, field, data[field])
    # Only customers have an address column; providers never persisted one.
    if customer is not None and "address" in data:
        customer.address = data["address"]

    db.commit()
    db.refresh(user)
    return profile_response(user, customer, provider)


def update_provider_profile(db: Session, user: User, payload: ProviderProfileUpdate) -> dict:
    provider = db.get(Provider, user.user_id)
    if provider is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Provider profile required")

    data = payload.model_dump(exclude_unset=True)

    if "full_name" in data:
        user.full_name = data["full_name"]
    if "phone" in data:
        user.phone = data["phone"]
    for field in (
        "business_name",
        "bio",
        "experience_years",
        "hourly_rate",
        "service_radius_km",
        "latitude",
        "longitude",
    ):
        if field in data:
            setattr(provider, field, data[field])

    db.commit()
    db.refresh(user)
    return profile_response(user, None, provider)


# ---------- provider service categories ----------

def get_provider_categories(db: Session, user: User) -> list[dict]:
    provider = db.get(Provider, user.user_id)
    if provider is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Provider profile required")
    return [
        _category_item(c)
        for c in sorted(provider.service_categories, key=lambda c: c.category_name)
    ]


def set_provider_categories(db: Session, user: User, category_ids: list[int]) -> list[dict]:
    """Replace the provider's service categories with the given set."""
    provider = db.get(Provider, user.user_id)
    if provider is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Provider profile required")

    wanted = set(category_ids)
    categories = []
    if wanted:
        categories = (
            db.query(ServiceCategory)
            .filter(
                ServiceCategory.category_id.in_(sorted(wanted)),
                ServiceCategory.is_active.is_(True),
            )
            .all()
        )
    missing = wanted - {c.category_id for c in categories}
    if missing:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Invalid or inactive category ids: {sorted(missing)}",
        )

    provider.service_categories = categories
    db.commit()
    db.refresh(provider)
    return [_category_item(c) for c in sorted(categories, key=lambda c: c.category_name)]


# ---------- public provider view ----------

def get_public_provider(db: Session, provider_id: int) -> dict:
    """Limited view of an approved, active provider (no email or phone)."""
    row = (
        db.query(Provider, User)
        .join(User, User.user_id == Provider.provider_id)
        .filter(
            Provider.provider_id == provider_id,
            Provider.approval_status == ApprovalStatus.APPROVED,
            User.account_status == AccountStatus.ACTIVE,
        )
        .first()
    )
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Provider not found")
    provider, user = row

    rating, count = (
        db.query(func.avg(Review.rating), func.count(Review.review_id))
        .filter(Review.reviewee_id == provider_id)
        .one()
    )
    return {
        "providerId": provider.provider_id,
        "name": user.full_name,
        "businessName": provider.business_name,
        "bio": provider.bio,
        "experienceYears": provider.experience_years,
        "hourlyRate": float(provider.hourly_rate) if provider.hourly_rate is not None else None,
        "serviceRadiusKm": float(provider.service_radius_km),
        "categories": [
            _category_item(c)
            for c in sorted(provider.service_categories, key=lambda c: c.category_name)
        ],
        "rating": round(float(rating), 2) if rating is not None else None,
        "reviewCount": count,
    }


# ---------- password ----------

def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    if current_password == new_password:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "New password must be different from the current password",
        )
    user.password_hash = hash_password(new_password)
    db.commit()


# ---------- account deletion (anonymise) ----------

def _deletion_blockers(db: Session, user: User, customer, provider) -> list[str]:
    blockers = []
    if customer is not None:
        if (
            db.query(ServiceRequest.request_id)
            .filter(
                ServiceRequest.customer_id == user.user_id,
                ServiceRequest.status.in_(_ACTIVE_REQUESTS),
            )
            .first()
        ):
            blockers.append("active service requests")
        if (
            db.query(EquipmentReservation.reservation_id)
            .filter(
                EquipmentReservation.renter_customer_id == user.user_id,
                EquipmentReservation.status.in_(_ACTIVE_RESERVATIONS),
            )
            .first()
        ):
            blockers.append("active equipment reservations")
    if provider is not None:
        if (
            db.query(ServiceRequest.request_id)
            .filter(
                ServiceRequest.selected_provider_id == user.user_id,
                ServiceRequest.status.in_(_ACTIVE_JOBS),
            )
            .first()
        ):
            blockers.append("jobs in progress")
        if (
            db.query(EquipmentReservation.reservation_id)
            .join(Equipment, Equipment.equipment_id == EquipmentReservation.equipment_id)
            .filter(
                Equipment.owner_provider_id == user.user_id,
                EquipmentReservation.status.in_(_ACTIVE_RESERVATIONS),
            )
            .first()
        ):
            blockers.append("active equipment rentals")
    return blockers


def delete_account(db: Session, user: User, password: str) -> None:
    """Anonymise the account. The row is kept so related history stays valid."""
    if user.role == UserRole.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin accounts cannot be deleted here")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Password is incorrect")

    customer, provider = _owner(db, user)
    blockers = _deletion_blockers(db, user, customer, provider)
    if blockers:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Cannot delete the account while there are "
            + ", ".join(blockers)
            + ". Complete or cancel them first.",
        )

    user.full_name = "Deleted user"
    user.email = f"deleted-{user.user_id}@{DELETED_EMAIL_DOMAIN}"
    user.phone = None
    user.password_hash = hash_password(secrets.token_urlsafe(32))  # unusable password
    user.account_status = AccountStatus.SUSPENDED  # blocks login and existing tokens

    if customer is not None:
        customer.address = None
        customer.latitude = None
        customer.longitude = None

    if provider is not None:
        provider.business_name = None
        provider.bio = None
        provider.latitude = None
        provider.longitude = None
        provider.service_categories = []
        # Stop the provider appearing in other members' flows.
        db.query(Quotation).filter(
            Quotation.provider_id == user.user_id,
            Quotation.status == QuotationStatus.SUBMITTED,
        ).update({Quotation.status: QuotationStatus.WITHDRAWN}, synchronize_session=False)
        db.query(Equipment).filter(
            Equipment.owner_provider_id == user.user_id,
        ).update({Equipment.status: EquipmentStatus.UNAVAILABLE}, synchronize_session=False)

    db.commit()