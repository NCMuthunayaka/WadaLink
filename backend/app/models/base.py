
"""Shared SQLAlchemy base, column types, and database session helpers."""

import enum
import os
from datetime import datetime
from typing import Type

from dotenv import load_dotenv
from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum as SAEnum,
    SmallInteger,
    create_engine,
    func,
)
from sqlalchemy.dialects.mysql import BIGINT, TINYINT
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    sessionmaker,
)

# Load environment variables from .env
load_dotenv()

# Database configuration

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured in the .env file")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# Shared SQLAlchemy base

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


# Shared column types

# BIGINT UNSIGNED on MySQL; BIGINT elsewhere.
BigIntUnsigned = BigInteger().with_variant(
    BIGINT(unsigned=True), "mysql"
)

# TINYINT UNSIGNED on MySQL; SMALLINT elsewhere.
TinyIntUnsigned = SmallInteger().with_variant(
    TINYINT(unsigned=True), "mysql"
)


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
