from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models.base import Base
from app.models.customer import Customer
from app.models.provider import ApprovalStatus, Provider
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User
from app.services.matching_service import MatchingService


def test_matching_uses_active_approved_providers_for_the_request_category():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        customer_user = User(
            user_id=1,
            full_name="Customer",
            email="customer@example.test",
            password_hash="test",
            role="customer",
            account_status="active",
        )
        approved_user = User(
            user_id=2,
            full_name="Approved Electrician",
            email="approved@example.test",
            password_hash="test",
            role="provider",
            account_status="active",
        )
        pending_user = User(
            user_id=3,
            full_name="Pending Electrician",
            email="pending@example.test",
            password_hash="test",
            role="provider",
            account_status="active",
        )
        category = ServiceCategory(category_name="Electrical", is_active=True)
        db.add_all([customer_user, approved_user, pending_user, category])
        db.flush()
        db.add(Customer(customer_id=customer_user.user_id))
        db.add_all([
            Provider(
                provider_id=approved_user.user_id,
                approval_status=ApprovalStatus.APPROVED,
                service_categories=[category],
                hourly_rate=40,
                service_radius_km=15,
                latitude=6.9271,
                longitude=79.8612,
            ),
            Provider(
                provider_id=pending_user.user_id,
                approval_status=ApprovalStatus.PENDING,
                service_categories=[category],
                hourly_rate=25,
                service_radius_km=15,
                latitude=6.9271,
                longitude=79.8612,
            ),
        ])
        db.flush()
        request = ServiceRequest(
            customer_id=customer_user.user_id,
            category_id=category.category_id,
            title="Repair a faulty outlet",
            description="One outlet is not working",
            address="Colombo",
            latitude=6.9271,
            longitude=79.8612,
            status=RequestStatus.OPEN,
        )
        db.add(request)
        db.commit()

        result = MatchingService.match(db, request)

        assert [provider["providerId"] for provider in result["providers"]] == [approved_user.user_id]
        assert result["priceOnlyProviderIds"] == [approved_user.user_id]
