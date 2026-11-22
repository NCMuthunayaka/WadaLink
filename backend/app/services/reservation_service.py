import math
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.equipment import Equipment, EquipmentStatus
from app.models.equipment_reservation import EquipmentReservation, ReservationStatus
from app.models.customer import Customer
from app.schemas.equipment_reservation import ReservationCreate, ReservationResponse, ReservationStatusUpdate


class ReservationService:
    VALID_STATUSES = {"reserved", "in_rent", "return_pending", "returned", "cancelled"}
    ACTIVE_STATUSES = [ReservationStatus.RESERVED, ReservationStatus.IN_RENT, ReservationStatus.RETURN_PENDING]

    @staticmethod
    def check_conflict(db: Session, equipment_id: int, start_date: datetime, end_date: datetime,
                       exclude_reservation_id: Optional[int] = None):
        query = db.query(EquipmentReservation).filter(
            EquipmentReservation.equipment_id == equipment_id,
            EquipmentReservation.status.in_(ReservationService.ACTIVE_STATUSES),
            EquipmentReservation.start_datetime < end_date,
            EquipmentReservation.end_datetime > start_date,
        )
        if exclude_reservation_id:
            query = query.filter(EquipmentReservation.reservation_id != exclude_reservation_id)
        return query.first()

    @classmethod
    def create_reservation(cls, db: Session, reservation_in: ReservationCreate, renter_id: int):
        renter = db.query(Customer).filter(Customer.customer_id == renter_id).first()
        if not renter:
            raise HTTPException(status_code=403, detail="A customer profile is required to rent equipment")
        equipment = db.query(Equipment).filter(Equipment.equipment_id == reservation_in.equipment_id).first()
        if not equipment:
            raise HTTPException(status_code=404, detail="Equipment not found")
        conflict = cls.check_conflict(db, equipment.equipment_id, reservation_in.start_date, reservation_in.end_date)
        if conflict:
            raise HTTPException(status_code=409, detail="Equipment is already reserved for the selected dates")
        days = max(1, math.ceil((reservation_in.end_date - reservation_in.start_date).total_seconds() / 86400))
        item = EquipmentReservation(
            equipment_id=equipment.equipment_id,
            renter_customer_id=renter_id,
            start_datetime=reservation_in.start_date,
            end_datetime=reservation_in.end_date,
            daily_rate_snapshot=equipment.daily_rate,
            total_cost=days * equipment.daily_rate,
            status=ReservationStatus.RESERVED,
        )
        equipment.status = EquipmentStatus.RESERVED
        db.add(item)
        db.commit()
        db.refresh(item)
        return cls._to_response(db, item, equipment)

    @classmethod
    def update_reservation_status(cls, db: Session, reservation_id: int, status_in: ReservationStatusUpdate, user_id: int):
        new_status = status_in.status.lower()
        if new_status not in cls.VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'")
        reservation = db.query(EquipmentReservation).filter(EquipmentReservation.reservation_id == reservation_id).first()
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        equipment = db.query(Equipment).filter(Equipment.equipment_id == reservation.equipment_id).first()
        if equipment is None or equipment.owner_provider_id != user_id:
            raise HTTPException(status_code=403, detail="Only the equipment owner can update this reservation")
        reservation.status = ReservationStatus(new_status)
        if new_status == "in_rent":
            equipment.status = EquipmentStatus.IN_RENT
        elif new_status == "return_pending":
            equipment.status = EquipmentStatus.RETURN_PENDING
        elif new_status in {"returned", "cancelled"}:
            equipment.status = EquipmentStatus.AVAILABLE
        db.commit()
        db.refresh(reservation)
        return cls._to_response(db, reservation, equipment)

    @classmethod
    def get_user_reservations(cls, db: Session, user_id: int):
        rows = db.query(EquipmentReservation).filter(
            EquipmentReservation.renter_customer_id == user_id
        ).order_by(EquipmentReservation.reservation_id.desc()).all()
        return [cls._to_response(db, row) for row in rows]

    @classmethod
    def get_reservation_by_id(cls, db: Session, reservation_id: int, user_id: int, user_role: str):
        row = db.query(EquipmentReservation).filter(EquipmentReservation.reservation_id == reservation_id).first()
        if not row:
            return None
        equipment = db.query(Equipment).filter(Equipment.equipment_id == row.equipment_id).first()
        is_customer_owner = user_role == "customer" and row.renter_customer_id == user_id
        is_equipment_owner = (
            user_role == "provider"
            and equipment is not None
            and equipment.owner_provider_id == user_id
        )
        if not is_customer_owner and not is_equipment_owner:
            raise HTTPException(status_code=403, detail="You do not have access to this reservation")
        return cls._to_response(db, row, equipment)

    @staticmethod
    def _to_response(db: Session, row: EquipmentReservation, equipment: Optional[Equipment] = None):
        equipment = equipment or db.query(Equipment).filter(Equipment.equipment_id == row.equipment_id).first()
        renter = db.query(Customer).filter(Customer.customer_id == row.renter_customer_id).first()
        renter_name = renter.user.full_name if renter and renter.user else None
        days = max(1, math.ceil((row.end_datetime - row.start_datetime).total_seconds() / 86400))
        return ReservationResponse(
            id=row.reservation_id,
            equipment_id=row.equipment_id,
            equipment_name=equipment.equipment_name if equipment else None,
            renter_id=row.renter_customer_id,
            renter_name=renter_name,
            start_date=row.start_datetime,
            end_date=row.end_datetime,
            total_days=days,
            daily_price=float(row.daily_rate_snapshot),
            total_price=float(row.total_cost),
            hold_amount=float(equipment.deposit_amount if equipment else 0),
            delivery_fee=0,
            status=row.status.value,
            payment_cleared=row.status == ReservationStatus.RETURNED,
            created_at=row.created_at,
            updated_at=None,
        )
