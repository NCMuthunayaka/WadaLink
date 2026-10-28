from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned

if TYPE_CHECKING:
    from .classification_log import ClassificationLog
    from .service_request import ServiceRequest


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    category_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    category_name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    parent_category_id: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("service_categories.category_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # --- self-referencing hierarchy (category -> subcategories) ---
    parent: Mapped[Optional["ServiceCategory"]] = relationship(
        back_populates="children", remote_side="ServiceCategory.category_id"
    )
    children: Mapped[List["ServiceCategory"]] = relationship(back_populates="parent")

    service_requests: Mapped[List["ServiceRequest"]] = relationship(back_populates="category")
    classification_logs: Mapped[List["ClassificationLog"]] = relationship(back_populates="category")

    def __repr__(self) -> str:
        return f"<ServiceCategory id={self.category_id} name={self.category_name!r}>"
