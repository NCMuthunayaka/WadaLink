import os
from typing import List
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "WedaLink API"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./wedalink.db")
    CORS_ORIGINS: List[str] = ["*"]
    JWT_SECRET: str = os.getenv("JWT_SECRET", "wedalink-secret-key-development")


settings = Settings()
