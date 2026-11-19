
"""Shared SQLAlchemy base, column types, and database session helpers."""

import enum
from datetime import datetime
from typing import Type

from app.core.config import settings
from sqlalchemy import (
    BigInteger,
    Integer,
    DateTime,
    Enum as SAEnum,
    SmallInteger,
    create_engine,
    func,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    sessionmaker,
)

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# Shared SQLAlchemy base

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


# Shared column types

# Neon is PostgreSQL, so the canonical model types are PostgreSQL-neutral.
# PostgreSQL has no UNSIGNED integer type; range checks belong in constraints.
# SQLite only supports automatic rowid generation for INTEGER PRIMARY KEY.
# Keep BIGINT on Neon/PostgreSQL while making the test database equivalent.
BigIntUnsigned = BigInteger().with_variant(Integer, "sqlite")
TinyIntUnsigned = SmallInteger()


# Enum helper

def db_enum(enum_cls: Type[enum.Enum], name: str) -> SAEnum:
    """Store enum values rather than enum member names."""
    return SAEnum(
        enum_cls,
        name=name,
        values_callable=lambda e: [member.value for member in e],
        native_enum=True,
        validate_strings=True,
    )

# Timestamp mixin

class TimestampMixin:
    """Common created_at and updated_at columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

# Database dependency for FastAPI

def get_db():
    """Provide a database session for each request."""
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
