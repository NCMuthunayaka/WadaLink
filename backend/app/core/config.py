import os
from pathlib import Path
from dotenv import load_dotenv

# Locate backend/.env regardless of the terminal's working directory
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_FILE)


class Settings:
    """Single application configuration used by API, DB and migrations."""

    PROJECT_NAME = "WedaLink"
    API_V1_STR = "/api/v1"
    DATABASE_URL = None
    JWT_SECRET_KEY = None
    JWT_ALGORITHM = "HS256"
    CORS_ORIGINS = ["http://localhost:5173", "http://localhost:8081"]

    def __init__(self) -> None:
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        if not self.DATABASE_URL:
            raise RuntimeError("DATABASE_URL is missing from backend/.env")
        if not self.JWT_SECRET_KEY:
            raise RuntimeError("JWT_SECRET_KEY is missing from backend/.env")


settings = Settings()
JWT_SECRET_KEY = settings.JWT_SECRET_KEY
JWT_ALGORITHM = settings.JWT_ALGORITHM
