from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL

# Handle connect_args for SQLite
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)
else:
    # MySQL / Postgres configuration
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
