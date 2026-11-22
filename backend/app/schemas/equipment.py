from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# ── Active Rental Representation ─────────────────────────────
class ActiveRentalInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    renter_name: str
    renter_phone: Optional[str] = None
    due_time: str
    hold_amount: float = 0.0
    pickup_location: Optional[str] = None
    return_location: Optional[str] = None
    eta: Optional[str] = None
    payment_cleared: bool = False


# ── Equipment Schemas ─────────────────────────────────────────
class EquipmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None
    price_per_day: float = Field(..., gt=0, description="Daily rate in USD or local currency")
    deposit: float = Field(default=0.0, ge=0)
    delivery_fee: float = Field(default=0.0, ge=0)
    delivery_radius: int = Field(default=0, ge=0)
    tags: List[str] = Field(default_factory=list)
    pickup_location: Optional[str] = None
    return_location: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    price_per_day: Optional[float] = Field(default=None, gt=0)
    deposit: Optional[float] = Field(default=None, ge=0)
    delivery_fee: Optional[float] = Field(default=None, ge=0)
    delivery_radius: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, description="available, reserved, in_rent, return_pending, maintenance")
    tags: Optional[List[str]] = None
    pickup_location: Optional[str] = None
    return_location: Optional[str] = None


class EquipmentResponse(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    active_rental: Optional[ActiveRentalInfo] = None


# ── Provider Fleet Stats ──────────────────────────────────────
class EquipmentStatsResponse(BaseModel):
    total_items: int
    in_rent: int
    mtd_revenue: float
    revenue_change: float = 14.0  # percentage compared to average
