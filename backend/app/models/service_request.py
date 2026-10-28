import enum
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, TimestampMixin, db_enum

if TYPE_CHECKING:
    from .classification_log import ClassificationLog
    from .customer import Customer
    from .equipment_reservation import EquipmentReservation
    from .message import Message
    from .notification import Notification
    from .provider import Provider
    from .provider_score import ProviderScore
    from .quotation import Quotation
    from .review import Review
    from .service_category import ServiceCategory


class UrgencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"


class RequestStatus(str, enum.Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ServiceRequest(TimestampMixin, Base):
    __tablename__ = "service_requests"
    __table_args__ = (
        CheckConstraint(
            "(budget_min IS NULL OR budget_min >= 0) AND "
            "(budget_max IS NULL OR budget_max >= 0) AND "
            "(budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)",
            name="chk_sr_budget",
        ),
        CheckConstraint("latitude IS NULL OR latitude BETWEEN -90 AND 90", name="chk_sr_lat"),
        CheckConstraint("longitude IS NULL OR longitude BETWEEN -180 AND 180", name="chk_sr_lng"),
        Index("idx_sr_status_urgency", "status", "urgency"),
        Index("idx_sr_created", "created_at"),
    )

    request_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("customers.customer_id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_categories.category_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    selected_provider_id: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("providers.provider_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    urgency: Mapped[UrgencyLevel] = mapped_column(
        db_enum(UrgencyLevel, "urgency_level"),
        nullable=False,
        default=UrgencyLevel.MEDIUM,
        server_default=UrgencyLevel.MEDIUM.value,
    )
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7))
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7))
    budget_min: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    budget_max: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    status: Mapped[RequestStatus] = mapped_column(
        db_enum(RequestStatus, "request_status"),
        nullable=False,
        default=RequestStatus.OPEN,
        server_default=RequestStatus.OPEN.value,
    )

    # --- parents ---
    customer: Mapped["Customer"] = relationship(back_populates="service_requests")
    category: Mapped[Optional["ServiceCategory"]] = relationship(back_populates="service_requests")
    selected_provider: Mapped[Optional["Provider"]] = relationship(back_populates="selected_requests")

    # --- children ---
    classification_logs: Mapped[List["ClassificationLog"]] = relationship(
        back_populates="request", cascade="all, delete-orphan", passive_deletes=True,
        order_by="ClassificationLog.created_at",
    )
    provider_scores: Mapped[List["ProviderScore"]] = relationship(
        back_populates="request", cascade="all, delete-orphan", passive_deletes=True,
        order_by="ProviderScore.rank_position",
    )
    quotations: Mapped[List["Quotation"]] = relationship(
        back_populates="request", cascade="all, delete-orphan", passive_deletes=True
    )
    messages: Mapped[List["Message"]] = relationship(
        back_populates="request", cascade="all, delete-orphan", passive_deletes=True,
        order_by="Message.sent_at",
    )
    reviews: Mapped[List["Review"]] = relationship(
        back_populates="request", cascade="all, delete-orphan", passive_deletes=True
    )
    notifications: Mapped[List["Notification"]] = relationship(back_populates="related_request")
    equipment_reservations: Mapped[List["EquipmentReservation"]] = relationship(
        back_populates="related_request"
    )

    def __repr__(self) -> str:
        return f"<ServiceRequest id={self.request_id} status={self.status.value}>"
