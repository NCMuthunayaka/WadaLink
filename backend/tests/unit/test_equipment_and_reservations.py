from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.customer import Customer
from app.models.provider import ApprovalStatus, Provider
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
    session.add_all([Provider(provider_id=1, approval_status=ApprovalStatus.APPROVED), Customer(customer_id=2)])
    session.commit()
    yield session
    session.close()


def make_equipment(name="FLIR E8-XT Thermal Camera", price=45.0):
    return EquipmentCreate(name=name, category="Diagnostic & Inspection", description="Professional thermal imager", price_per_day=price, deposit=150.0)


def test_equipment_routes_scope_fleet_to_authenticated_owner(db_session):
    from app.api.v1.equipment import create_equipment_listing, get_provider_fleet
    from app.api.v1.reservations import fleet_reservations

    owner = db_session.get(User, 1)
    other = User(user_id=3, full_name="Other provider", email="other@test.com",
                 password_hash="test", role=UserRole.PROVIDER, account_status=AccountStatus.ACTIVE)
    db_session.add(other)
    db_session.flush()
    db_session.add(Provider(provider_id=3))
    db_session.commit()
    equipment = create_equipment_listing(make_equipment(), current_user=owner, db=db_session)
    assert equipment.owner_id == owner.user_id
    assert len(get_provider_fleet(current_user=owner, db=db_session)) == 1
    assert get_provider_fleet(current_user=other, db=db_session) == []
    start = datetime.now() + timedelta(days=1)
    ReservationService.create_reservation(db_session, ReservationCreate(
        equipment_id=equipment.id, start_date=start, end_date=start + timedelta(days=1)), renter_id=2)
    assert len(fleet_reservations(db=db_session, user=owner)) == 1
    assert fleet_reservations(db=db_session, user=other) == []


def test_equipment_crud(db_session):
    input_data = EquipmentCreate(
        name="FLIR E8-XT Thermal Camera",
        category="Diagnostic & Inspection",
        description="Professional thermal imager",
        image_url="https://example.test/thermal-camera.jpg",
        price_per_day=45.0,
        deposit=150.0,
        delivery_fee=10.0,
        delivery_radius=20,
        tags=["thermal", "inspection"],
        pickup_location="Colombo",
        return_location="Colombo",
    )
    equipment = EquipmentService.create_equipment(db_session, input_data, owner_id=1)
    assert equipment.equipment_id is not None
    assert equipment.equipment_name == "FLIR E8-XT Thermal Camera"
    assert equipment.status == EquipmentStatus.AVAILABLE
    assert float(equipment.daily_rate) == 45.0
    response = EquipmentService.get_equipment_by_id(db_session, equipment.equipment_id)
    assert response.image_url == input_data.image_url
    assert response.delivery_fee == 10.0
    assert response.delivery_radius == 20
    assert response.tags == ["thermal", "inspection"]
    assert response.pickup_location == "Colombo"
    assert response.return_location == "Colombo"

    results = EquipmentService.get_equipment_list(db_session, category="Diagnostic", search="FLIR")
    assert len(results) == 1
    assert results[0].id == equipment.equipment_id

    updated = EquipmentService.update_equipment(db_session, equipment.equipment_id, EquipmentUpdate(price_per_day=50.0), owner_id=1)
    assert float(updated.daily_rate) == 50.0


def test_public_equipment_catalog_hides_unapproved_provider_listings(db_session):
    pending_user = User(
        user_id=3,
        full_name="Pending Provider",
        email="pending@test.com",
        password_hash="test",
        role=UserRole.PROVIDER,
        account_status=AccountStatus.ACTIVE,
    )
    db_session.add(pending_user)
    db_session.flush()
    db_session.add(Provider(provider_id=3, approval_status=ApprovalStatus.PENDING))
    db_session.commit()
    pending_listing = EquipmentService.create_equipment(db_session, make_equipment(), owner_id=3)

    assert all(
        item.id != pending_listing.equipment_id
        for item in EquipmentService.get_equipment_list(db_session)
    )
    assert len(EquipmentService.get_provider_fleet(db_session, 3)) == 1


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
