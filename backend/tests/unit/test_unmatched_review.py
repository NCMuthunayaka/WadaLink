from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.ai_admin import UnmatchedDecision, review_unmatched_request, unmatched_requests
from app.api.v1.requests import create_request
from app.models.ai_review import LabeledRequest, ReviewQueueStatus, UnmatchedRequest
from app.models.base import Base
from app.models.classification_log import ClassificationLog
from app.models.customer import Customer
from app.models.notification import Notification
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User
from app.schemas.request_api import RequestCreate
from app.services.classification_service import ClassificationService


def test_uncategorized_request_is_saved_then_admin_can_assign_category(monkeypatch):
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        customer = User(
            user_id=1,
            full_name="Customer",
            email="customer@example.test",
            password_hash="test",
            role="customer",
            account_status="active",
        )
        admin = User(
            user_id=2,
            full_name="Admin",
            email="admin@example.test",
            password_hash="test",
            role="admin",
            account_status="active",
        )
        category = ServiceCategory(
            category_name="Specialist Repair",
            description="Repairs outside the main categories",
            is_active=True,
        )
        db.add_all([customer, admin, category])
        db.flush()
        db.add(Customer(customer_id=customer.user_id))
        db.commit()

        def unexpected_classification(*args, **kwargs):
            raise AssertionError("manual-review requests must not be auto-classified")

        monkeypatch.setattr(ClassificationService.pipeline, "classify", unexpected_classification)
        result = create_request(
            RequestCreate(
                title="Specialist repair",
                description="Repair a specialist item not listed in categories",
                address="Colombo",
                manualReview=True,
            ),
            db,
            customer,
        )

        request_id = int(result["id"])
        request = db.get(ServiceRequest, request_id)
        unmatched = db.query(UnmatchedRequest).filter_by(request_id=request_id).one()
        assert result["categoryId"] is None
        assert request.category_id is None
        assert request.status == RequestStatus.OPEN
        assert unmatched.status == "pending"
        assert unmatched_requests(db, admin)[0]["requestId"] == request_id

        reviewed = review_unmatched_request(
            unmatched.unmatched_id,
            UnmatchedDecision(decision="assign", categoryId=category.category_id),
            db,
            admin,
        )

        assert reviewed["status"] == "resolved"
        assert request.category_id == category.category_id
        assert db.query(ClassificationLog).filter_by(request_id=request_id).order_by(
            ClassificationLog.created_at.desc()
        ).first().layer == "admin"
        assert db.query(LabeledRequest).filter_by(
            request_id=request_id, status=ReviewQueueStatus.APPROVED
        ).one().suggested_category == category.category_name
        assert db.query(Notification).filter_by(
            user_id=customer.user_id, event_type="unmatched_request_assign"
        ).count() == 1
