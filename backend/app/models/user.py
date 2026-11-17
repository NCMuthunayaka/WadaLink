from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    role = Column(String(20), default="customer")  # customer, provider, admin
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    equipment_owned = relationship("Equipment", back_populates="owner", cascade="all, delete-orphan")
    reservations = relationship("EquipmentReservation", back_populates="renter", cascade="all, delete-orphan")
