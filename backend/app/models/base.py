"""Shared SQLAlchemy base, column types and helpers for all models."""
import enum
from datetime import datetime
from typing import Type

from sqlalchemy import BigInteger, DateTime, Enum as SAEnum, SmallInteger, func
from sqlalchemy.dialects.mysql import BIGINT, TINYINT
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Declarative base. Import this in Alembic's env.py:
    `from models import Base` -> `target_metadata = Base.metadata`
    """


# BIGINT UNSIGNED on MySQL, plain BIGINT elsewhere (e.g. SQLite for tests)
BigIntUnsigned = BigInteger().with_variant(BIGINT(unsigned=True), "mysql")
TinyIntUnsigned = SmallInteger().with_variant(TINYINT(unsigned=True), "mysql")


def db_enum(enum_cls: Type[enum.Enum], name: str) -> SAEnum:
    """Store the enum *values* (lowercase strings) in the database."""
    return SAEnum(
        enum_cls,
        name=name,
        values_callable=lambda e: [m.value for m in e],
        native_enum=True,
        validate_strings=True,
    )


class TimestampMixin:
    """created_at / updated_at columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
