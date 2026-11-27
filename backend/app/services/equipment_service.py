from typing import List, Optional

from sqlalchemy import String, cast, func, or_
from sqlalchemy.orm import Session

from app.models.equipment import Equipment, EquipmentStatus
from app.models.equipment_reservation import EquipmentReservation
from app.models.provider import ApprovalStatus, Provider
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentStatsResponse
from app.models.user import User


class EquipmentService:
    """Equipment operations using the normalized PostgreSQL model."""

    @staticmethod
    def _response(item: Equipment) -> EquipmentResponse:
        return EquipmentResponse(
            id=item.equipment_id,
            owner_id=item.owner_provider_id,
            name=item.equipment_name,
            category=item.category or "Uncategorized",
            description=item.description,
            image_url=item.image_url,
            price_per_day=float(item.daily_rate),
            deposit=float(item.deposit_amount or 0),
            delivery_fee=float(item.delivery_fee or 0),
            delivery_radius=item.delivery_radius or 0,
            tags=item.tags or [],
            status=item.status.value if hasattr(item.status, "value") else str(item.status),
            pickup_location=item.pickup_location,
            return_location=item.return_location,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )

    @staticmethod
    def create_equipment(db: Session, equipment_in: EquipmentCreate, owner_id: int) -> Equipment:
        item = Equipment(
            owner_provider_id=owner_id,
            equipment_name=equipment_in.name,
            category=equipment_in.category,
            description=equipment_in.description,
            daily_rate=equipment_in.price_per_day,
            deposit_amount=equipment_in.deposit,
            image_url=equipment_in.image_url,
            delivery_fee=equipment_in.delivery_fee,
            delivery_radius=equipment_in.delivery_radius,
            tags=equipment_in.tags,
            pickup_location=equipment_in.pickup_location,
            return_location=equipment_in.return_location,
            condition_description=None,
            status=EquipmentStatus.AVAILABLE,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def get_equipment_by_id(db: Session, equipment_id: int) -> Optional[EquipmentResponse]:
        item = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
        return EquipmentService._response(item) if item else None

    @staticmethod
    def get_equipment_list(db: Session, category=None, search=None, status=None,
                           min_price=None, max_price=None, skip=0, limit=50) -> List[EquipmentResponse]:
        query = db.query(Equipment).join(
            Provider, Equipment.owner_provider_id == Provider.provider_id
        ).join(User, User.user_id == Provider.provider_id).filter(
            Provider.approval_status == ApprovalStatus.APPROVED,
            User.account_status == "active",
        )
        if category and category.lower() != "all":
            query = query.filter(Equipment.category.ilike(f"%{category}%"))
        if search:
            search_term = f"%{search}%"
            query = query.filter(or_(
                Equipment.equipment_name.ilike(search_term),
                Equipment.description.ilike(search_term),
                Equipment.category.ilike(search_term),
                cast(Equipment.tags, String).ilike(search_term),
            ))
        if status and status.lower() != "all":
            query = query.filter(Equipment.status == status)
        if min_price is not None:
            query = query.filter(Equipment.daily_rate >= min_price)
        if max_price is not None:
            query = query.filter(Equipment.daily_rate <= max_price)
        return [EquipmentService._response(x) for x in query.order_by(Equipment.equipment_id.desc()).offset(skip).limit(limit).all()]

    @staticmethod
    def get_provider_fleet(db: Session, provider_id: int) -> List[EquipmentResponse]:
        return [EquipmentService._response(x) for x in db.query(Equipment).filter(Equipment.owner_provider_id == provider_id).all()]

    @staticmethod
    def get_provider_stats(db: Session, provider_id: int) -> EquipmentStatsResponse:
        total = db.query(Equipment).filter(Equipment.owner_provider_id == provider_id).count()
        active = db.query(Equipment).filter(
            Equipment.owner_provider_id == provider_id,
            Equipment.status.in_([EquipmentStatus.RESERVED, EquipmentStatus.IN_RENT, EquipmentStatus.RETURN_PENDING]),
        ).count()
        revenue = db.query(func.sum(EquipmentReservation.total_cost)).join(
            Equipment, EquipmentReservation.equipment_id == Equipment.equipment_id
        ).filter(Equipment.owner_provider_id == provider_id).scalar() or 0
        return EquipmentStatsResponse(total_items=total, in_rent=active, mtd_revenue=float(revenue), revenue_change=0)

    @staticmethod
    def update_equipment(db: Session, equipment_id: int, equipment_in: EquipmentUpdate, owner_id: int):
        item = db.query(Equipment).filter(
            Equipment.equipment_id == equipment_id,
            Equipment.owner_provider_id == owner_id,
        ).first()
        if not item:
            return None
        values = equipment_in.model_dump(exclude_unset=True)
        mapping = {
            "name": "equipment_name",
            "price_per_day": "daily_rate",
            "deposit": "deposit_amount",
        }
        for key, value in values.items():
            if key in mapping:
                key = mapping[key]
            if hasattr(item, key):
                setattr(item, key, value)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def delete_equipment(db: Session, equipment_id: int, owner_id: int) -> bool:
        item = db.query(Equipment).filter(
            Equipment.equipment_id == equipment_id,
            Equipment.owner_provider_id == owner_id,
        ).first()
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True
