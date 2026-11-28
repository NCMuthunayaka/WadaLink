from decimal import Decimal
from typing import ClassVar, Literal

from pydantic import BaseModel, Field, model_validator

UrgencyValue = Literal["low", "medium", "high", "emergency"]
_MAX_BUDGET = Decimal("99999999.99")  # Numeric(10, 2)


def _check_budget_order(budget_min, budget_max) -> None:
    if budget_min is not None and budget_max is not None and budget_min > budget_max:
        raise ValueError("budgetMin cannot be greater than budgetMax")


class RequestCreate(BaseModel):
    categoryId: int | None = None
    manualReview: bool = False
    title: str = Field(max_length=200)
    description: str = Field(min_length=3, max_length=10000)
    urgency: UrgencyValue = "medium"
    address: str = Field(max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    budgetMin: Decimal | None = Field(default=None, ge=0, le=_MAX_BUDGET)
    budgetMax: Decimal | None = Field(default=None, ge=0, le=_MAX_BUDGET)

    @model_validator(mode="after")
    def budget_range_is_valid(self):
        _check_budget_order(self.budgetMin, self.budgetMax)
        if self.manualReview and self.categoryId is not None:
            raise ValueError("manualReview requires categoryId to be null")
        return self


class RequestUpdate(BaseModel):
    """Partial update: only the fields the client sends are changed."""

    NON_NULLABLE: ClassVar[tuple[str, ...]] = ("title", "description", "urgency", "address")

    categoryId: int | None = None
    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, min_length=3, max_length=10000)
    urgency: UrgencyValue | None = None
    address: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    budgetMin: Decimal | None = Field(default=None, ge=0, le=_MAX_BUDGET)
    budgetMax: Decimal | None = Field(default=None, ge=0, le=_MAX_BUDGET)

    @model_validator(mode="after")
    def validate_update(self):
        for name in self.NON_NULLABLE:
            if name in self.model_fields_set and getattr(self, name) is None:
                raise ValueError(f"{name} cannot be null")
        _check_budget_order(self.budgetMin, self.budgetMax)
        return self


class RequestCancel(BaseModel):
    reason: str | None = Field(default=None, max_length=500)


def request_response(request):
    return {
        "id": str(request.request_id),
        "customerId": str(request.customer_id),
        "categoryId": str(request.category_id) if request.category_id else None,
        "title": request.title,
        "description": request.description,
        "urgency": request.urgency.value,
        "address": request.address,
        "latitude": float(request.latitude) if request.latitude is not None else None,
        "longitude": float(request.longitude) if request.longitude is not None else None,
        "budgetMin": float(request.budget_min) if request.budget_min is not None else None,
        "budgetMax": float(request.budget_max) if request.budget_max is not None else None,
        "status": request.status.value,
        "createdAt": request.created_at.isoformat() if request.created_at else None,
        "updatedAt": request.updated_at.isoformat() if request.updated_at else None,
    }