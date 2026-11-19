
"""Backward-compatible imports for the canonical model database module."""

from app.models.base import Base, SessionLocal, engine, get_db

__all__ = ["Base", "SessionLocal", "engine", "get_db"]
