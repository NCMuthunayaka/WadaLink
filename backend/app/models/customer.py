from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, TimestampMixin

if TYPE_CHECKING:
    from .service_request import ServiceRequest
    from .user import User


class Customer(TimestampMixin, Base):
    __tablename__ = "customers"
    __table_args__ = (
        CheckConstraint("latitude IS NULL OR latitude BETWEEN -90 AND 90", name="chk_customers_lat"),
        CheckConstraint("longitude IS NULL OR longitude BETWEEN -180 AND 180", name="chk_customers_lng"),
    )

    # Same ID as the owning user
    customer_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
        autoincrement=False,
    )
    address: Mapped[Optional[str]] = mapped_column(String(255))
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7))
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7))

    user: Mapped["User"] = relationship(back_populates="customer")
    service_requests: Mapped[List["ServiceRequest"]] = relationship(back_populates="customer")

    def __repr__(self) -> str:
        return f"<Customer id={self.customer_id}>"
