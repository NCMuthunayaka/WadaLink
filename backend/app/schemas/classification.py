from typing import Any, Optional

from pydantic import BaseModel, Field


class ClassificationDetails(BaseModel):
    riskHeadline: Optional[str] = None
    anomaly: Optional[str] = None
    rootCause: Optional[str] = None
    credentials: Optional[str] = None
    durationHours: Optional[dict[str, float]] = None
    costRange: Optional[dict[str, float]] = None
    safetyTips: list[str] = []


class ClassificationResponse(BaseModel):
    requestId: int
    categoryId: Optional[int] = None
    categoryName: str
    predictedUrgency: str
    confidence: float = Field(ge=0, le=1)
    status: str
    modelName: str
    details: ClassificationDetails


class ClassificationInput(BaseModel):
    title: Optional[str] = None
    description: str = Field(min_length=3, max_length=10000)

