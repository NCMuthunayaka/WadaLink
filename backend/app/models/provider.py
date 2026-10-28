import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, TimestampMixin, db_enum

if TYPE_CHECKING:
    from .equipment import Equipment
    from .equipment_reservation import EquipmentReservation
    from .provider_score import ProviderScore
    from .quotation import Quotation
    from .service_request import ServiceRequest
    from .user import User


class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Provider(TimestampMixin, Base):
    __tablename__ = "providers"
    __table_args__ = (
        CheckConstraint("experience_years >= 0", name="chk_providers_exp"),
        CheckConstraint("hourly_rate IS NULL OR hourly_rate >= 0", name="chk_providers_rate"),
        CheckConstraint("service_radius_km >= 0", name="chk_providers_radius"),
        Index("idx_providers_approval", "approval_status"),
    )

    # Same ID as the owning user
    provider_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
        autoincrement=False,
    )
    business_name: Mapped[Optional[str]] = mapped_column(String(150))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    hourly_rate: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    service_radius_km: Mapped[Decimal] = mapped_column(
        Numeric(8, 2), nullable=False, default=Decimal("10.00"), server_default="10.00"
    )
    approval_status: Mapped[ApprovalStatus] = mapped_column(
        db_enum(ApprovalStatus, "approval_status"),
        nullable=False,
        default=ApprovalStatus.PENDING,
        server_default=ApprovalStatus.PENDING.value,
    )
    approved_by: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- users (two FKs to users -> foreign_keys must be explicit) ---
    user: Mapped["User"] = relationship(back_populates="provider", foreign_keys=[provider_id])
    approver: Mapped[Optional["User"]] = relationship(
        back_populates="approved_providers", foreign_keys=[approved_by]
    )

    # --- business relationships ---
    selected_requests: Mapped[List["ServiceRequest"]] = relationship(back_populates="selected_provider")
    provider_scores: Mapped[List["ProviderScore"]] = relationship(
        back_populates="provider", cascade="all, delete-orphan", passive_deletes=True
    )
    quotations: Mapped[List["Quotation"]] = relationship(
        back_populates="provider", cascade="all, delete-orphan", passive_deletes=True
    )
    equipment: Mapped[List["Equipment"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan", passive_deletes=True
    )
    equipment_reservations: Mapped[List["EquipmentReservation"]] = relationship(
        back_populates="renter"
    )

    def __repr__(self) -> str:
        return f"<Provider id={self.provider_id} status={self.approval_status.value}>"
