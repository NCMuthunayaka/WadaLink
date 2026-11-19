import math
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.equipment import Equipment
from app.models.equipment_reservation import EquipmentReservation
from app.models.user import User
from app.schemas.equipment_reservation import (
    ReservationCreate,
    ReservationStatusUpdate,
    ReservationResponse,
)


class ReservationService:
    VALID_STATUSES = {"reserved", "in_rent", "return_pending", "returned", "cancelled"}

    @staticmethod
    def check_conflict(
        db: Session,
        equipment_id: int,
        start_date: datetime,
        end_date: datetime,
        exclude_reservation_id: Optional[int] = None,
    ) -> Optional[EquipmentReservation]:
        """
        Double-Booking Validation Algorithm:
        Determines whether the given equipment is already booked during any part of [start_date, end_date].
        Overlap formula: (existing.start_date < end_date) AND (existing.end_date > start_date)
        """
        query = db.query(EquipmentReservation).filter(
            EquipmentReservation.equipment_id == equipment_id,
            EquipmentReservation.status.in_(["reserved", "in_rent", "return_pending"]),
            EquipmentReservation.start_date < end_date,
            EquipmentReservation.end_date > start_date,
        )

        if exclude_reservation_id:
            query = query.filter(EquipmentReservation.id != exclude_reservation_id)

        # Check for conflicts
        return query.first()

    @classmethod
    def create_reservation(
        db: Session,
        reservation_in: ReservationCreate,
        renter_id: int,
    ) -> ReservationResponse:
        """
        Creates a new reservation with double-booking validation and ACID transaction.
        Lifecycle transition: (available -> reserved)
        """
        # 1. Fetch equipment
        equipment = db.query(Equipment).filter(Equipment.id == reservation_in.equipment_id).first()
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Equipment with ID {reservation_in.equipment_id} not found."
            )

        if equipment.status == "maintenance":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Equipment is currently under maintenance and cannot be reserved."
            )

        # 2. Conflict / Double-booking Validation
        conflict = ReservationService.check_conflict(
            db=db,
            equipment_id=reservation_in.equipment_id,
            start_date=reservation_in.start_date,
            end_date=reservation_in.end_date,
        )

        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Conflict: Equipment '{equipment.name}' is already reserved between "
                    f"{conflict.start_date.strftime('%Y-%m-%d %H:%M')} and "
                    f"{conflict.end_date.strftime('%Y-%m-%d %H:%M')}."
                ),
            )

        # 3. Calculation of duration & financial terms
        duration_seconds = (reservation_in.end_date - reservation_in.start_date).total_seconds()
        total_days = max(1, math.ceil(duration_seconds / 86400))

        daily_price = float(equipment.price_per_day)
        delivery_fee = float(equipment.delivery_fee or 0.0)
        hold_amount = float(equipment.deposit or 0.0)
        total_price = (total_days * daily_price) + delivery_fee

        try:
            # 4. Create reservation record
            new_reservation = EquipmentReservation(
                equipment_id=equipment.id,
                renter_id=renter_id,
                start_date=reservation_in.start_date,
                end_date=reservation_in.end_date,
                total_days=total_days,
                daily_price=daily_price,
                total_price=total_price,
                hold_amount=hold_amount,
                delivery_fee=delivery_fee,
                status="reserved",
                pickup_location=reservation_in.pickup_location or equipment.pickup_location,
                return_location=reservation_in.return_location or equipment.return_location,
                notes=reservation_in.notes,
                payment_cleared=False,
            )
            db.add(new_reservation)

            # 5. Transition equipment status to 'reserved'
            equipment.status = "reserved"

            db.commit()
            db.refresh(new_reservation)

            return ReservationService._to_response(db, new_reservation, equipment)

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create reservation: {str(e)}",
            )

    @classmethod
    def update_reservation_status(
        cls,
        db: Session,
        reservation_id: int,
        status_in: ReservationStatusUpdate,
        user_id: int,
    ) -> ReservationResponse:
        """
        Status Lifecycle Transaction Handling:
        Handles valid transitions:
        - reserved -> in_rent (Check-out / Pickup)
        - in_rent -> return_pending (Return initiated)
        - return_pending -> returned (Checked in & verified by provider)
        - reserved -> cancelled (Booking cancelled)
        """
        new_status = status_in.status.lower()
        if new_status not in cls.VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{new_status}'. Allowed values: {cls.VALID_STATUSES}",
            )

        reservation = (
            db.query(EquipmentReservation)
            .filter(EquipmentReservation.id == reservation_id)
            .first()
        )
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reservation with ID {reservation_id} not found.",
            )

        equipment = db.query(Equipment).filter(Equipment.id == reservation.equipment_id).first()
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated equipment record not found.",
            )

        current_status = reservation.status

        # Validate transition paths
        if current_status == "returned":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reservation is already finalized as 'returned'.",
            )
        if current_status == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reservation is already cancelled.",
            )

        try:
            reservation.status = new_status
            if status_in.notes:
                reservation.notes = f"{reservation.notes or ''}\n[{new_status.upper()}]: {status_in.notes}".strip()

            # Lifecycle mapping to equipment status
            if new_status == "in_rent":
                equipment.status = "in_rent"
            elif new_status == "return_pending":
                equipment.status = "return_pending"
            elif new_status == "returned":
                # Equipment is checked in, return to available
                equipment.status = "available"
                reservation.payment_cleared = True
            elif new_status == "cancelled":
                # Check if there are other active reservations; if none, equipment returns to available
                has_other_active = (
                    db.query(EquipmentReservation)
                    .filter(
                        EquipmentReservation.equipment_id == equipment.id,
                        EquipmentReservation.id != reservation.id,
                        EquipmentReservation.status.in_(["reserved", "in_rent"]),
                    )
                    .first()
                )
                if not has_other_active:
                    equipment.status = "available"

            db.commit()
            db.refresh(reservation)
            return cls._to_response(db, reservation, equipment)

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update reservation status: {str(e)}",
            )

    @classmethod
    def get_user_reservations(cls, db: Session, user_id: int) -> List[ReservationResponse]:
        reservations = (
            db.query(EquipmentReservation)
            .filter(EquipmentReservation.renter_id == user_id)
            .order_by(EquipmentReservation.id.desc())
            .all()
        )
        return [cls._to_response(db, r) for r in reservations]

    @classmethod
    def get_reservation_by_id(cls, db: Session, reservation_id: int) -> Optional[ReservationResponse]:
        reservation = (
            db.query(EquipmentReservation)
            .filter(EquipmentReservation.id == reservation_id)
            .first()
        )
        if not reservation:
            return None
        return cls._to_response(db, reservation)

    @staticmethod
    def _to_response(
        db: Session,
        reservation: EquipmentReservation,
        equipment: Optional[Equipment] = None,
    ) -> ReservationResponse:
        if not equipment:
            equipment = (
                db.query(Equipment).filter(Equipment.id == reservation.equipment_id).first()
            )
        renter = db.query(User).filter(User.id == reservation.renter_id).first()

        return ReservationResponse(
            id=reservation.id,
            equipment_id=reservation.equipment_id,
            equipment_name=equipment.name if equipment else "Unknown Equipment",
            renter_id=reservation.renter_id,
            renter_name=renter.name if renter else "Customer",
            start_date=reservation.start_date,
            end_date=reservation.end_date,
            total_days=reservation.total_days,
            daily_price=float(reservation.daily_price),
            total_price=float(reservation.total_price),
            hold_amount=float(reservation.hold_amount or 0.0),
            delivery_fee=float(reservation.delivery_fee or 0.0),
            status=reservation.status,
            pickup_location=reservation.pickup_location,
            return_location=reservation.return_location,
            payment_cleared=bool(reservation.payment_cleared),
            notes=reservation.notes,
            created_at=reservation.created_at,
            updated_at=reservation.updated_at,
        )
