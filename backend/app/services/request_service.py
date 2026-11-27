from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.classification_log import ClassificationLog, ClassificationStatus
from app.models.notification import DeliveryStatus, Notification, NotificationChannel
from app.models.quotation import Quotation, QuotationStatus
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest, UrgencyLevel
from app.models.user import User
from app.schemas.request_api import RequestUpdate, request_response

_CANCELLABLE = (RequestStatus.OPEN, RequestStatus.ASSIGNED)

# (payload field, model column)
_SIMPLE_FIELDS = (
    ("title", "title"),
    ("description", "description"),
    ("address", "address"),
    ("latitude", "latitude"),
    ("longitude", "longitude"),
    ("budgetMin", "budget_min"),
    ("budgetMax", "budget_max"),
)
# Edits to these fields count as user feedback for the AI classification log.
_CLASSIFICATION_FIELDS = ("categoryId", "urgency", "title", "description")


def _get_own(db: Session, user: User, request_id: int) -> ServiceRequest:
    request = db.get(ServiceRequest, request_id)
    if request is None or request.customer_id != user.user_id:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


def _require_active_category(db: Session, category_id: int) -> None:
    category = db.get(ServiceCategory, category_id)
    if category is None or not category.is_active:
        raise HTTPException(status_code=400, detail="Invalid category")


def list_own(
    db: Session,
    user: User,
    request_status: RequestStatus | None = None,
    limit: int | None = None,
    offset: int = 0,
) -> list[dict]:
    query = db.query(ServiceRequest).filter(ServiceRequest.customer_id == user.user_id)
    if request_status is not None:
        query = query.filter(ServiceRequest.status == request_status)
    query = query.order_by(ServiceRequest.created_at.desc(), ServiceRequest.request_id.desc())
    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)
    return [request_response(row) for row in query.all()]


def update_request(db: Session, user: User, request_id: int, payload: RequestUpdate) -> dict:
    request = _get_own(db, user, request_id)
    if request.status != RequestStatus.OPEN:
        raise HTTPException(status_code=409, detail="Only open requests may be edited")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return request_response(request)

    # Validate everything before changing anything.
    if data.get("categoryId") is not None:
        _require_active_category(db, data["categoryId"])
    new_min = data.get("budgetMin", request.budget_min)
    new_max = data.get("budgetMax", request.budget_max)
    if new_min is not None and new_max is not None and Decimal(new_min) > Decimal(new_max):
        raise HTTPException(status_code=422, detail="budgetMin cannot be greater than budgetMax")

    if "categoryId" in data:
        request.category_id = data["categoryId"]
    for field, column in _SIMPLE_FIELDS:
        if field in data:
            setattr(request, column, data[field])
    if "urgency" in data:
        request.urgency = UrgencyLevel(data["urgency"])

    if any(field in data for field in _CLASSIFICATION_FIELDS):
        category = db.get(ServiceCategory, request.category_id) if request.category_id else None
        db.add(
            ClassificationLog(
                request=request,
                category=category,
                predicted_urgency=request.urgency,
                model_name="manual",
                model_version="manual",
                layer="user",
                confidence_score=1 if category else 0,
                status=ClassificationStatus.SUCCESS if category else ClassificationStatus.FALLBACK,
                output_json={"safetyTips": []},
            )
        )

    db.commit()
    db.refresh(request)
    return request_response(request)


def cancel_request(db: Session, user: User, request_id: int, reason: str | None = None) -> dict:
    request = _get_own(db, user, request_id)
    if request.status == RequestStatus.CANCELLED:
        raise HTTPException(status_code=409, detail="Request is already cancelled")
    if request.status not in _CANCELLABLE:
        raise HTTPException(
            status_code=409, detail="Only open or assigned requests can be cancelled"
        )

    # Providers who still have a stake in this request: those with a pending
    # or accepted quotation, plus the selected provider.
    recipients = {
        row[0]
        for row in db.query(Quotation.provider_id).filter(
            Quotation.request_id == request.request_id,
            Quotation.status.in_((QuotationStatus.SUBMITTED, QuotationStatus.ACCEPTED)),
        )
    }
    if request.selected_provider_id is not None:
        recipients.add(request.selected_provider_id)

    request.status = RequestStatus.CANCELLED

    message = "The customer cancelled this request."
    if reason:
        message += f" Reason: {reason}"
    for provider_id in sorted(recipients):
        db.add(
            Notification(
                user_id=provider_id,
                related_request_id=request.request_id,
                event_type="request_cancelled",
                title="Service request cancelled",
                message=message,
                channel=NotificationChannel.IN_APP,
                delivery_status=DeliveryStatus.PENDING,
            )
        )

    db.commit()
    db.refresh(request)
    return request_response(request)