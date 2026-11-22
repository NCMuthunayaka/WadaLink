import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, BigIntUnsigned


class ReviewQueueStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class LabeledRequest(Base):
    __tablename__ = "llm_labeled_requests"
    __table_args__ = (Index("idx_llm_status", "status", "created_at"),)
    labeled_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    request_id: Mapped[Optional[int]] = mapped_column(BigIntUnsigned, ForeignKey("service_requests.request_id", ondelete="SET NULL"))
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_category: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(nullable=False)
    status: Mapped[ReviewQueueStatus] = mapped_column(String(20), default=ReviewQueueStatus.PENDING, nullable=False)
    reviewed_by: Mapped[Optional[int]] = mapped_column(BigIntUnsigned, ForeignKey("users.user_id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class CategoryProposal(Base):
    __tablename__ = "category_proposals"
    proposal_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[ReviewQueueStatus] = mapped_column(String(20), default=ReviewQueueStatus.PENDING, nullable=False)
    proposed_by: Mapped[Optional[int]] = mapped_column(BigIntUnsigned, ForeignKey("users.user_id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class UnmatchedRequest(Base):
    __tablename__ = "unmatched_requests"
    unmatched_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    request_id: Mapped[Optional[int]] = mapped_column(BigIntUnsigned, ForeignKey("service_requests.request_id", ondelete="CASCADE"), nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class ModelRegistry(Base):
    __tablename__ = "ai_model_registry"
    model_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    artifact_path: Mapped[str] = mapped_column(String(255), nullable=False)
    validation_accuracy: Mapped[float] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="candidate")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
