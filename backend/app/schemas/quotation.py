from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class QuotationCreate(BaseModel):
    request_id: int = Field(gt=0)
    proposed_price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    estimated_duration_hours: Decimal | None = Field(default=None, ge=0, max_digits=8, decimal_places=2)
    available_from: datetime | None = None
    message: str | None = Field(default=None, max_length=2000)


class QuotationResponse(BaseModel):
    id: str
    requestId: str
    providerId: str
    pricingType: str
    amount: float
    hourlyRate: float | None = None
    estimatedDurationMinutes: int
    arrivalWindow: dict[str, str | None]
    notes: str | None = None
    status: str
    submittedAt: datetime


def quotation_response(quotation):
    duration = float(quotation.estimated_duration_hours or 0)
    return {
        'id': str(quotation.quotation_id), 'requestId': str(quotation.request_id),
        'providerId': str(quotation.provider_id), 'pricingType': 'fixed',
        'amount': float(quotation.proposed_price), 'hourlyRate': None,
        'estimatedDurationMinutes': round(duration * 60),
        'arrivalWindow': {'from': quotation.available_from.isoformat() if quotation.available_from else None, 'to': None},
        'notes': quotation.message, 'status': quotation.status.value,
        'submittedAt': quotation.created_at,
    }
