from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, JSON, Numeric, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned

if TYPE_CHECKING:
    from .provider import Provider
    from .service_request import ServiceRequest


class ProviderScore(Base):
    __tablename__ = "provider_scores"
    __table_args__ = (
        UniqueConstraint("request_id", "provider_id", name="uq_ps_request_provider"),
        CheckConstraint("rank_position IS NULL OR rank_position >= 1", name="chk_ps_rank"),
        Index("idx_ps_request_rank", "request_id", "rank_position"),
    )

    score_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
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
    rating_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4))
    price_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4))
    experience_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4))
    distance_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4))
    response_time_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4))
    total_score: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)
    rank_position: Mapped[Optional[int]] = mapped_column(Integer)
    score_explanation: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    request: Mapped["ServiceRequest"] = relationship(back_populates="provider_scores")
    provider: Mapped["Provider"] = relationship(back_populates="provider_scores")

    def __repr__(self) -> str:
        return f"<ProviderScore request={self.request_id} provider={self.provider_id} total={self.total_score}>"
