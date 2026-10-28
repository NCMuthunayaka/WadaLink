from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned

if TYPE_CHECKING:
    from .user import User


class AdminLog(Base):
    __tablename__ = "admin_logs"
    __table_args__ = (
        Index("idx_al_admin", "admin_id", "created_at"),
        Index("idx_al_target", "target_type", "target_id"),
    )

    log_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    target_user_id: Mapped[Optional[int]] = mapped_column(
        BigIntUnsigned,
        ForeignKey("users.user_id", ondelete="SET NULL", onupdate="CASCADE"),
        index=True,
    )
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    target_type: Mapped[Optional[str]] = mapped_column(String(100))
    target_id: Mapped[Optional[int]] = mapped_column(BigIntUnsigned)
    reason: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    admin: Mapped["User"] = relationship(back_populates="admin_logs", foreign_keys=[admin_id])
    target_user: Mapped[Optional["User"]] = relationship(
        back_populates="admin_logs_as_target", foreign_keys=[target_user_id]
    )

    def __repr__(self) -> str:
        return f"<AdminLog id={self.log_id} action={self.action_type!r}>"
