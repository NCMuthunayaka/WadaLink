import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, TimestampMixin, db_enum

if TYPE_CHECKING:
    from .provider import Provider
    from .service_request import ServiceRequest


class QuotationStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Quotation(TimestampMixin, Base):
    __tablename__ = "quotations"
    __table_args__ = (
        UniqueConstraint("request_id", "provider_id", name="uq_quotation_request_provider"),
        CheckConstraint("proposed_price >= 0", name="chk_q_price"),
        CheckConstraint(
            "estimated_duration_hours IS NULL OR estimated_duration_hours >= 0",
            name="chk_q_duration",
        ),
    )

    quotation_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_requests.request_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    provider_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("providers.provider_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    proposed_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    estimated_duration_hours: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2))
    available_from: Mapped[Optional[datetime]] = mapped_column(DateTime)
    message: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[QuotationStatus] = mapped_column(
        db_enum(QuotationStatus, "quotation_status"),
        nullable=False,
        default=QuotationStatus.SUBMITTED,
        server_default=QuotationStatus.SUBMITTED.value,
        index=True,
    )

    request: Mapped["ServiceRequest"] = relationship(back_populates="quotations")
    provider: Mapped["Provider"] = relationship(back_populates="quotations")

    def __repr__(self) -> str:
        return f"<Quotation id={self.quotation_id} price={self.proposed_price} status={self.status.value}>"
