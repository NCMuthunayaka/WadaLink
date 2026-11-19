import enum
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, TimestampMixin, db_enum

if TYPE_CHECKING:
    from .equipment_reservation import EquipmentReservation
    from .provider import Provider


class EquipmentStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    UNAVAILABLE = "unavailable"
    SUSPENDED = "suspended"


class Equipment(TimestampMixin, Base):
    __tablename__ = "equipment"
    __table_args__ = (
        CheckConstraint("daily_rate >= 0", name="chk_eq_rate"),
        CheckConstraint("deposit_amount >= 0", name="chk_eq_deposit"),
        Index("idx_eq_status_category", "status", "category"),
    )

    equipment_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    owner_provider_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("providers.provider_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    equipment_name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    daily_rate: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    deposit_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("0.00"), server_default="0.00"
    )
    condition_description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[EquipmentStatus] = mapped_column(
        db_enum(EquipmentStatus, "equipment_status"),
        nullable=False,
        default=EquipmentStatus.AVAILABLE,
        server_default=EquipmentStatus.AVAILABLE.value,
    )

    owner: Mapped["Provider"] = relationship(back_populates="equipment")
    reservations: Mapped[List["EquipmentReservation"]] = relationship(back_populates="equipment")

    def __repr__(self) -> str:
        return f"<Equipment id={self.equipment_id} name={self.equipment_name!r}>"
