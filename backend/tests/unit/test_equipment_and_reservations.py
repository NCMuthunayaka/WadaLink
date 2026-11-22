from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.customer import Customer
from app.models.provider import Provider
from app.models.user import AccountStatus, User, UserRole
from app.models.equipment import EquipmentStatus
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate
from app.schemas.equipment_reservation import ReservationCreate, ReservationStatusUpdate
from app.services.equipment_service import EquipmentService
from app.services.reservation_service import ReservationService


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    provider_user = User(
        user_id=1, full_name="Marcus Rodriguez", email="marcus@test.com",
        password_hash="test", role=UserRole.PROVIDER, account_status=AccountStatus.ACTIVE,
    )
    renter_user = User(
        user_id=2, full_name="Sparkline Electrical", email="sparkline@test.com",
        password_hash="test", role=UserRole.CUSTOMER, account_status=AccountStatus.ACTIVE,
    )
    session.add_all([provider_user, renter_user])
    session.flush()
    session.add_all([Provider(provider_id=1), Customer(customer_id=2)])
    session.commit()
    yield session
    session.close()


def make_equipment(name="FLIR E8-XT Thermal Camera", price=45.0):
    return EquipmentCreate(name=name, category="Diagnostic & Inspection", description="Professional thermal imager", price_per_day=price, deposit=150.0)


def test_equipment_crud(db_session):
    equipment = EquipmentService.create_equipment(db_session, make_equipment(), owner_id=1)
    assert equipment.equipment_id is not None
    assert equipment.equipment_name == "FLIR E8-XT Thermal Camera"
    assert equipment.status == EquipmentStatus.AVAILABLE
    assert float(equipment.daily_rate) == 45.0

    results = EquipmentService.get_equipment_list(db_session, category="Diagnostic", search="FLIR")
    assert len(results) == 1
    assert results[0].id == equipment.equipment_id

    updated = EquipmentService.update_equipment(db_session, equipment.equipment_id, EquipmentUpdate(price_per_day=50.0), owner_id=1)
    assert float(updated.daily_rate) == 50.0


def test_reservation_conflict_validation(db_session):
    equipment = EquipmentService.create_equipment(db_session, make_equipment("Greenlee Bender", 65.0), owner_id=1)
    start = datetime.now() + timedelta(days=2)
    end = start + timedelta(days=3)
    reservation = ReservationService.create_reservation(db_session, ReservationCreate(equipment_id=equipment.equipment_id, start_date=start, end_date=end), renter_id=2)
    assert reservation.id is not None
    assert reservation.total_days == 3
    assert reservation.status == "reserved"
    with pytest.raises(HTTPException) as exc:
        ReservationService.create_reservation(db_session, ReservationCreate(equipment_id=equipment.equipment_id, start_date=start + timedelta(days=1), end_date=end + timedelta(days=1)), renter_id=2)
    assert exc.value.status_code == 409


def test_status_lifecycle_handling(db_session):
    equipment = EquipmentService.create_equipment(db_session, make_equipment("CAT Excavator", 185.0), owner_id=1)
    now = datetime.now()
    reservation = ReservationService.create_reservation(db_session, ReservationCreate(equipment_id=equipment.equipment_id, start_date=now + timedelta(days=1), end_date=now + timedelta(days=3)), renter_id=2)
    ReservationService.update_reservation_status(db_session, reservation.id, ReservationStatusUpdate(status="in_rent"), user_id=1)
    db_session.refresh(equipment)
    assert equipment.status == EquipmentStatus.IN_RENT
    ReservationService.update_reservation_status(db_session, reservation.id, ReservationStatusUpdate(status="return_pending"), user_id=1)
    db_session.refresh(equipment)
    assert equipment.status == EquipmentStatus.RETURN_PENDING
    returned = ReservationService.update_reservation_status(db_session, reservation.id, ReservationStatusUpdate(status="returned"), user_id=1)
    assert returned.status == "returned"
    db_session.refresh(equipment)
    assert equipment.status == EquipmentStatus.AVAILABLE

    with pytest.raises(HTTPException) as exc:
        ReservationService.update_reservation_status(db_session, reservation.id, ReservationStatusUpdate(status="in_rent"), user_id=2)
    assert exc.value.status_code == 403
