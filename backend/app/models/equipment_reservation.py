from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, Boolean, ForeignKey, func, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class EquipmentReservation(Base):
    __tablename__ = "equipment_reservations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    renter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_days = Column(Integer, nullable=False, default=1)
    daily_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    hold_amount = Column(Numeric(10, 2), default=0.00)
    delivery_fee = Column(Numeric(10, 2), default=0.00)
    status = Column(String(30), nullable=False, default="reserved", index=True)
    pickup_location = Column(String(255), nullable=True)
    return_location = Column(String(255), nullable=True)
    payment_cleared = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    equipment = relationship("Equipment", back_populates="reservations")
    renter = relationship("User", back_populates="reservations")

    # Composite Index for efficient conflict/double-booking checks
    __table_args__ = (
        Index("idx_res_equipment_dates", "equipment_id", "start_date", "end_date"),
    )
