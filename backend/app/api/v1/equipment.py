from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.services.equipment_service import EquipmentService
from app.schemas.equipment import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentResponse,
    EquipmentStatsResponse,
)

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.get("/", response_model=List[EquipmentResponse])
def browse_equipment(
    category: Optional[str] = Query(None, description="Category filter (e.g. Diagnostic, Heavy Machinery)"),
    search: Optional[str] = Query(None, description="Search term matching name, description, or category"),
    status: Optional[str] = Query(None, description="Equipment status filter (available, reserved, in_rent, etc.)"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search and browse equipment catalog for customers with flexible filtering.
    """
    items = EquipmentService.get_equipment_list(
        db=db,
        category=category,
        search=search,
        status=status,
        min_price=min_price,
        max_price=max_price,
        skip=skip,
        limit=limit,
    )
    return items


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
def create_equipment_listing(
    equipment_in: EquipmentCreate,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """
    Provider adds a new equipment listing to their fleet.
    """
    equipment = EquipmentService.create_equipment(db=db, equipment_in=equipment_in, owner_id=current_user.user_id)
    return EquipmentService._response(equipment)


@router.get("/fleet", response_model=List[EquipmentResponse])
def get_provider_fleet(
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """
    Returns the provider's equipment fleet including active rental data for current bookings.
    """
    return EquipmentService.get_provider_fleet(db=db, provider_id=current_user.user_id)


@router.get("/stats", response_model=EquipmentStatsResponse)
def get_provider_stats(
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """
    Returns fleet metrics (total items, in rent count, MTD revenue, growth percentage).
    """
    return EquipmentService.get_provider_stats(db=db, provider_id=current_user.user_id)


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_detail(
    equipment_id: int,
    db: Session = Depends(get_db),
):
    """
    Fetch full specifications and pricing for a single piece of equipment.
    """
    equipment = EquipmentService.get_equipment_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID {equipment_id} not found",
        )
    return equipment


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    equipment_in: EquipmentUpdate,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """
    Update pricing, availability, or specifications for an equipment item.
    """
    updated = EquipmentService.update_equipment(
        db=db,
        equipment_id=equipment_id,
        equipment_in=equipment_in,
        owner_id=current_user.user_id,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found or not owned by user",
        )
    return EquipmentService._response(updated)


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: int,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """
    Remove an equipment item from the catalog.
    """
    deleted = EquipmentService.delete_equipment(db=db, equipment_id=equipment_id, owner_id=current_user.user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found or not owned by user",
        )
    return None
