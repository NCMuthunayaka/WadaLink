from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, TinyIntUnsigned

if TYPE_CHECKING:
    from .service_request import ServiceRequest
    from .user import User


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("request_id", "reviewer_id", name="uq_review_request_reviewer"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="chk_rev_rating"),
        CheckConstraint("reviewer_id <> reviewee_id", name="chk_rev_not_self"),
    )

    review_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_requests.request_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    reviewer_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    reviewee_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    rating: Mapped[int] = mapped_column(TinyIntUnsigned, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    request: Mapped["ServiceRequest"] = relationship(back_populates="reviews")
    # Two FKs to users -> foreign_keys must be explicit
    reviewer: Mapped["User"] = relationship(
        back_populates="reviews_written", foreign_keys=[reviewer_id]
    )
    reviewee: Mapped["User"] = relationship(
        back_populates="reviews_received", foreign_keys=[reviewee_id]
    )

    def __repr__(self) -> str:
        return f"<Review id={self.review_id} rating={self.rating}>"
