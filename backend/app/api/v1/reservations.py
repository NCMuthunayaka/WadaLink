from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.services.reservation_service import ReservationService
from app.schemas.equipment_reservation import (
    ReservationCreate,
    ReservationStatusUpdate,
    ReservationResponse,
)

router = APIRouter(prefix="/reservations", tags=["Equipment Reservations"])


@router.post("/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def book_equipment(
    reservation_in: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer")),
):
    """
    Book equipment with double-booking / conflict validation and ACID transaction.
    State transition: available -> reserved.
    """
    return ReservationService.create_reservation(
        db=db,
        reservation_in=reservation_in,
        renter_id=current_user.user_id,
    )


@router.get("/check-availability")
def check_availability(
    equipment_id: int,
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
):
    """
    Verify if specific dates are available without creating a booking.
    """
    conflict = ReservationService.check_conflict(
        db=db,
        equipment_id=equipment_id,
        start_date=start_date,
        end_date=end_date,
    )
    if conflict:
        return {
            "available": False,
            "conflict_start": conflict.start_date,
            "conflict_end": conflict.end_date,
            "message": "Equipment is already booked for the selected date range.",
        }
    return {
        "available": True,
        "message": "Selected dates are available for reservation.",
    }


@router.get("/my", response_model=List[ReservationResponse])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer")),
):
    """
    Retrieve reservations booked by the current customer.
    """
    return ReservationService.get_user_reservations(db=db, user_id=current_user.user_id)


@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation_detail(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "provider")),
):
    """
    Get full details of a specific reservation.
    """
    res = ReservationService.get_reservation_by_id(
        db=db,
        reservation_id=reservation_id,
        user_id=current_user.user_id,
        user_role=current_user.role.value,
    )
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reservation with ID {reservation_id} not found",
        )
    return res


@router.patch("/{reservation_id}/status", response_model=ReservationResponse)
def update_reservation_lifecycle_status(
    reservation_id: int,
    status_in: ReservationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
):
    """
    Status Lifecycle Transaction Handling:
    - Picked Up / Dispatched: reserved -> in_rent
    - Drop-off in progress: in_rent -> return_pending
    - Check-in & Verified: return_pending -> returned (resets equipment to available)
    - Cancelled: reserved -> cancelled (reverts equipment to available)
    """
    return ReservationService.update_reservation_status(
        db=db,
        reservation_id=reservation_id,
        status_in=status_in,
        user_id=current_user.user_id,
    )
