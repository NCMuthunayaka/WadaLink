import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.core.database import Base
from app.models.user import User
from app.models.equipment import Equipment
from app.models.equipment_reservation import EquipmentReservation
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate
from app.schemas.equipment_reservation import ReservationCreate, ReservationStatusUpdate
from app.services.equipment_service import EquipmentService
from app.services.reservation_service import ReservationService


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Seed test users
    provider = User(id=1, name="Marcus Rodriguez", email="marcus@test.com", role="provider")
    customer = User(id=2, name="Sparkline Electrical", email="sparkline@test.com", role="customer")
    session.add_all([provider, customer])
    session.commit()

    yield session
    session.close()


def test_equipment_crud(db_session):
    # 1. Create equipment
    eq_in = EquipmentCreate(
        name="FLIR E8-XT Thermal Camera",
        category="Diagnostic & Inspection",
        description="Professional thermal imager",
        price_per_day=45.0,
        deposit=150.0,
        delivery_fee=10.0,
        delivery_radius=20,
        tags=["Ready", "Inspection"],
        pickup_location="Downtown Yard",
    )
    equipment = EquipmentService.create_equipment(db_session, eq_in, owner_id=1)
    assert equipment.id is not None
    assert equipment.name == "FLIR E8-XT Thermal Camera"
    assert equipment.status == "available"
    assert float(equipment.price_per_day) == 45.0

    # 2. Search equipment
    results = EquipmentService.get_equipment_list(db_session, category="Diagnostic", search="FLIR")
    assert len(results) == 1
    assert results[0].id == equipment.id

    # 3. Update equipment
    up_in = EquipmentUpdate(price_per_day=50.0)
    updated = EquipmentService.update_equipment(db_session, equipment.id, up_in, owner_id=1)
    assert float(updated.price_per_day) == 50.0


def test_reservation_and_conflict_validation(db_session):
    # Setup gear
    eq_in = EquipmentCreate(
        name="Greenlee 555 Conduit Bender",
        category="Heavy Electrical Tools",
        price_per_day=65.0,
        deposit=200.0,
        delivery_fee=0.0,
    )
    equipment = EquipmentService.create_equipment(db_session, eq_in, owner_id=1)

    now = datetime.now()
    start_date = now + timedelta(days=2)
    end_date = now + timedelta(days=5)

    # 1. First reservation should succeed
    res_in = ReservationCreate(
        equipment_id=equipment.id,
        start_date=start_date,
        end_date=end_date,
    )
    reservation = ReservationService.create_reservation(db_session, res_in, renter_id=2)
    assert reservation.id is not None
    assert reservation.total_days == 3
    assert reservation.total_price == 3 * 65.0
    assert reservation.status == "reserved"

    # Equipment status should transition to 'reserved'
    db_session.refresh(equipment)
    assert equipment.status == "reserved"

    # 2. Attempting a double-booking during overlapping dates must raise 409 Conflict
    overlapping_res = ReservationCreate(
        equipment_id=equipment.id,
        start_date=start_date + timedelta(days=1),
        end_date=end_date + timedelta(days=2),
    )
    with pytest.raises(HTTPException) as exc_info:
        ReservationService.create_reservation(db_session, overlapping_res, renter_id=2)
    assert exc_info.value.status_code == 409
    assert "already reserved" in exc_info.value.detail

    # 3. Non-overlapping reservation (after current one ends) should succeed
    future_res = ReservationCreate(
        equipment_id=equipment.id,
        start_date=end_date + timedelta(days=1),
        end_date=end_date + timedelta(days=3),
    )
    # This shouldn't conflict with the date range
    conflict = ReservationService.check_conflict(
        db_session, equipment.id, future_res.start_date, future_res.end_date
    )
    assert conflict is None


def test_status_lifecycle_handling(db_session):
    eq_in = EquipmentCreate(
        name="CAT 301.5 Mini Excavator",
        category="Heavy Machinery",
        price_per_day=185.0,
    )
    equipment = EquipmentService.create_equipment(db_session, eq_in, owner_id=1)

    now = datetime.now()
    res_in = ReservationCreate(
        equipment_id=equipment.id,
        start_date=now + timedelta(days=1),
        end_date=now + timedelta(days=3),
    )
    res = ReservationService.create_reservation(db_session, res_in, renter_id=2)
    assert res.status == "reserved"

    # Lifecycle 1: Dispatched / Picked Up -> in_rent
    up_status = ReservationStatusUpdate(status="in_rent")
    res_in_rent = ReservationService.update_reservation_status(db_session, res.id, up_status, user_id=1)
    assert res_in_rent.status == "in_rent"
    db_session.refresh(equipment)
    assert equipment.status == "in_rent"

    # Lifecycle 2: Return Initiated -> return_pending
    up_pending = ReservationStatusUpdate(status="return_pending")
    res_pending = ReservationService.update_reservation_status(db_session, res.id, up_pending, user_id=1)
    assert res_pending.status == "return_pending"
    db_session.refresh(equipment)
    assert equipment.status == "return_pending"

    # Lifecycle 3: Checked In & Inspected by Provider -> returned
    up_returned = ReservationStatusUpdate(status="returned")
    res_returned = ReservationService.update_reservation_status(db_session, res.id, up_returned, user_id=1)
    assert res_returned.status == "returned"
    assert res_returned.payment_cleared is True

    # Equipment MUST transition back to 'available'
    db_session.refresh(equipment)
    assert equipment.status == "available"
