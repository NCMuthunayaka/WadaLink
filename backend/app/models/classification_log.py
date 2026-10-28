import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, db_enum
from .service_request import UrgencyLevel

if TYPE_CHECKING:
    from .service_category import ServiceCategory
    from .service_request import ServiceRequest


class ClassificationStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"
    FALLBACK = "fallback"


class ClassificationLog(Base):
    __tablename__ = "classification_logs"
    __table_args__ = (
        CheckConstraint(
            "confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1",
            name="chk_cl_confidence",
        ),
        Index("idx_cl_request", "request_id", "created_at"),
    )

    classification_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_requests.request_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_categories.category_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    predicted_urgency: Mapped[Optional[UrgencyLevel]] = mapped_column(
        db_enum(UrgencyLevel, "urgency_level")
    )
    model_name: Mapped[Optional[str]] = mapped_column(String(100))
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4))
    input_text: Mapped[Optional[str]] = mapped_column(Text)
    output_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    status: Mapped[ClassificationStatus] = mapped_column(
        db_enum(ClassificationStatus, "classification_status"),
        nullable=False,
        default=ClassificationStatus.SUCCESS,
        server_default=ClassificationStatus.SUCCESS.value,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    request: Mapped["ServiceRequest"] = relationship(back_populates="classification_logs")
    category: Mapped[Optional["ServiceCategory"]] = relationship(back_populates="classification_logs")

    def __repr__(self) -> str:
        return f"<ClassificationLog id={self.classification_id} status={self.status.value}>"
