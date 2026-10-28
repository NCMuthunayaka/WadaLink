from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Index, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned

if TYPE_CHECKING:
    from .service_request import ServiceRequest
    from .user import User


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (Index("idx_msg_request_sent", "request_id", "sent_at"),)

    message_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_requests.request_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    sender_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    request: Mapped["ServiceRequest"] = relationship(back_populates="messages")
    sender: Mapped["User"] = relationship(back_populates="sent_messages")

    def __repr__(self) -> str:
        return f"<Message id={self.message_id} request={self.request_id}>"
