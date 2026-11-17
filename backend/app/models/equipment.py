from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    price_per_day = Column(Numeric(10, 2), nullable=False)
    deposit = Column(Numeric(10, 2), default=0.00)
    delivery_fee = Column(Numeric(10, 2), default=0.00)
    delivery_radius = Column(Integer, default=0)
    status = Column(String(30), nullable=False, default="available", index=True)
    tags = Column(JSON, nullable=True, default=list)
    pickup_location = Column(String(255), nullable=True)
    return_location = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="equipment_owned")
    reservations = relationship(
        "EquipmentReservation",
        back_populates="equipment",
        cascade="all, delete-orphan",
        order_by="desc(EquipmentReservation.created_at)"
    )
