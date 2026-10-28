import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, db_enum

if TYPE_CHECKING:
    from .equipment import Equipment
    from .provider import Provider
    from .service_request import ServiceRequest


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    RESERVED = "reserved"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class EquipmentReservation(Base):
    __tablename__ = "equipment_reservations"
    __table_args__ = (
        CheckConstraint("end_datetime > start_datetime", name="chk_er_dates"),
        CheckConstraint("daily_rate_snapshot >= 0", name="chk_er_rate"),
        CheckConstraint("total_cost >= 0", name="chk_er_total"),
        Index("idx_er_equipment_dates", "equipment_id", "start_datetime", "end_datetime"),
    )

    reservation_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    equipment_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("equipment.equipment_id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    renter_provider_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("providers.provider_id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    related_request_id: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_requests.request_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    start_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    # Price agreed at booking time; unaffected by later rate changes
    daily_rate_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    total_cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(
        db_enum(ReservationStatus, "reservation_status"),
        nullable=False,
        default=ReservationStatus.PENDING,
        server_default=ReservationStatus.PENDING.value,
        index=True,
    )
    reserved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    returned_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    equipment: Mapped["Equipment"] = relationship(back_populates="reservations")
    renter: Mapped["Provider"] = relationship(back_populates="equipment_reservations")
    related_request: Mapped[Optional["ServiceRequest"]] = relationship(
        back_populates="equipment_reservations"
    )

    def __repr__(self) -> str:
        return f"<EquipmentReservation id={self.reservation_id} status={self.status.value}>"
