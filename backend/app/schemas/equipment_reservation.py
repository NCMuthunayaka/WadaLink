from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReservationCreate(BaseModel):
    equipment_id: int
    start_date: datetime
    end_date: datetime
    pickup_location: Optional[str] = None
    return_location: Optional[str] = None
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be strictly after start_date")
        return self


class ReservationStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        description="Allowed statuses: 'reserved', 'in_rent', 'return_pending', 'returned', 'cancelled'"
    )
    notes: Optional[str] = None


class ReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    equipment_id: int
    equipment_name: Optional[str] = None
    renter_id: int
    renter_name: Optional[str] = None
    start_date: datetime
    end_date: datetime
    total_days: int
    daily_price: float
    total_price: float
    hold_amount: float
    delivery_fee: float
    status: str
    pickup_location: Optional[str] = None
    return_location: Optional[str] = None
    payment_cleared: bool = False
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

