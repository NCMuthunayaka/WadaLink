from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
import app.models  # ensure models are registered
from app.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schema is managed explicitly with Alembic, not implicitly at startup.
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="WedaLink - AI Service Marketplace with Equipment Rental API",
    lifespan=lifespan,
)

# CORS middleware for Expo mobile app and web admin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health(db: Session = Depends(get_db)):
    """Application and database connectivity probe."""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
