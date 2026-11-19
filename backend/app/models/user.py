import enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BigIntUnsigned, TimestampMixin, db_enum

if TYPE_CHECKING:
    from .admin_log import AdminLog
    from .customer import Customer
    from .message import Message
    from .notification import Notification
    from .provider import Provider
    from .review import Review


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"


class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (Index("idx_users_role_status", "role", "account_status"),)

    user_id: Mapped[int] = mapped_column(BigIntUnsigned, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    role: Mapped[UserRole] = mapped_column(db_enum(UserRole, "user_role"), nullable=False)
    account_status: Mapped[AccountStatus] = mapped_column(
        db_enum(AccountStatus, "account_status"),
        nullable=False,
        default=AccountStatus.PENDING,
        server_default=AccountStatus.PENDING.value,
    )

    # --- profiles (one-to-one) ---
    customer: Mapped[Optional["Customer"]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan", passive_deletes=True
    )
    provider: Mapped[Optional["Provider"]] = relationship(
        back_populates="user",
        uselist=False,
        foreign_keys="Provider.provider_id",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # --- admin approvals: one admin -> many approved providers ---
    approved_providers: Mapped[List["Provider"]] = relationship(
        back_populates="approver", foreign_keys="Provider.approved_by"
    )

    # --- messaging / notifications ---
    sent_messages: Mapped[List["Message"]] = relationship(back_populates="sender")
    notifications: Mapped[List["Notification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )

    # --- reviews ---
    reviews_written: Mapped[List["Review"]] = relationship(
        back_populates="reviewer", foreign_keys="Review.reviewer_id",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    reviews_received: Mapped[List["Review"]] = relationship(
        back_populates="reviewee", foreign_keys="Review.reviewee_id",
        cascade="all, delete-orphan", passive_deletes=True,
    )

    # --- admin audit ---
    admin_logs: Mapped[List["AdminLog"]] = relationship(
        back_populates="admin", foreign_keys="AdminLog.admin_id"
    )
    admin_logs_as_target: Mapped[List["AdminLog"]] = relationship(
        back_populates="target_user", foreign_keys="AdminLog.target_user_id"
    )

    def __repr__(self) -> str:
        return f"<User id={self.user_id} email={self.email!r} role={self.role.value}>"
