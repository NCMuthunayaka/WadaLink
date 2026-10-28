import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, db_enum

if TYPE_CHECKING:
    from .service_request import ServiceRequest
    from .user import User


class NotificationChannel(str, enum.Enum):
    IN_APP = "in_app"
    EMAIL = "email"


class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (Index("idx_notif_user_read", "user_id", "is_read", "created_at"),)

    notification_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    related_request_id: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_requests.request_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text)
    channel: Mapped[NotificationChannel] = mapped_column(
        db_enum(NotificationChannel, "notification_channel"),
        nullable=False,
        default=NotificationChannel.IN_APP,
        server_default=NotificationChannel.IN_APP.value,
    )
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")
    delivery_status: Mapped[DeliveryStatus] = mapped_column(
        db_enum(DeliveryStatus, "delivery_status"),
        nullable=False,
        default=DeliveryStatus.PENDING,
        server_default=DeliveryStatus.PENDING.value,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    user: Mapped["User"] = relationship(back_populates="notifications")
    related_request: Mapped[Optional["ServiceRequest"]] = relationship(back_populates="notifications")

    def __repr__(self) -> str:
        return f"<Notification id={self.notification_id} event={self.event_type!r}>"
