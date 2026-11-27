from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.notification import DeliveryStatus, Notification, NotificationChannel
from app.models.provider import ApprovalStatus, Provider
from app.models.quotation import Quotation, QuotationStatus
from app.models.review import Review
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User

QUOTATION_FILTERS = ("submitted", "accepted", "rejected", "withdrawn", "cancelled")
_ACTIVE = (RequestStatus.ASSIGNED, RequestStatus.IN_PROGRESS)
_JOB_KEYS = {
    RequestStatus.ASSIGNED: "assigned",
    RequestStatus.IN_PROGRESS: "inProgress",
    RequestStatus.COMPLETED: "completed",
    RequestStatus.CANCELLED: "cancelled",
}


def _provider(db: Session, user: User) -> Provider:
    provider = db.get(Provider, user.user_id)
    if provider is None:
        raise HTTPException(status_code=403, detail="Provider profile required")
    return provider


def _effective_status(quote: Quotation, request: ServiceRequest) -> str:
    return "cancelled" if request.status == RequestStatus.CANCELLED else quote.status.value


# ---------- jobs the provider was selected for ----------

def _job_items(
    db: Session,
    provider_id: int,
    statuses=None,
    *,
    request_id: int | None = None,
    limit: int | None = None,
    offset: int = 0,
) -> list[dict]:
    query = db.query(ServiceRequest).filter(ServiceRequest.selected_provider_id == provider_id)
    if statuses:
        query = query.filter(ServiceRequest.status.in_(statuses))
    if request_id is not None:
        query = query.filter(ServiceRequest.request_id == request_id)
    query = query.order_by(ServiceRequest.updated_at.desc(), ServiceRequest.request_id.desc())
    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)
    requests = query.all()
    if not requests:
        return []

    quotes = {
        q.request_id: q
        for q in db.query(Quotation).filter(
            Quotation.provider_id == provider_id,
            Quotation.request_id.in_([r.request_id for r in requests]),
        )
    }
    category_ids = {r.category_id for r in requests if r.category_id}
    names = (
        {
            c.category_id: c.category_name
            for c in db.query(ServiceCategory).filter(
                ServiceCategory.category_id.in_(sorted(category_ids))
            )
        }
        if category_ids
        else {}
    )
    customers = {
        u.user_id: u.full_name
        for u in db.query(User).filter(
            User.user_id.in_(sorted({r.customer_id for r in requests}))
        )
    }

    items = []
    for request in requests:
        quote = quotes.get(request.request_id)
        items.append(
            {
                "id": request.request_id,
                "title": request.title,
                "description": request.description,
                "address": request.address,
                "urgency": request.urgency.value,
                "status": request.status.value,
                "categoryId": request.category_id,
                "categoryName": names.get(request.category_id),
                "customerName": customers.get(request.customer_id),
                "agreedPrice": (
                    float(quote.proposed_price)
                    if quote and quote.status == QuotationStatus.ACCEPTED
                    else None
                ),
                "quotationId": quote.quotation_id if quote else None,
                "createdAt": request.created_at,
                "updatedAt": request.updated_at,
            }
        )
    return items


def list_my_jobs(
    db: Session,
    user: User,
    status: RequestStatus | None = None,
    limit: int | None = None,
    offset: int = 0,
) -> list[dict]:
    provider = _provider(db, user)
    return _job_items(
        db,
        provider.provider_id,
        [status] if status is not None else None,
        limit=limit,
        offset=offset,
    )


# ---------- the provider's own quotations ----------

def list_my_quotations(
    db: Session,
    user: User,
    status: str | None = None,
    limit: int | None = None,
    offset: int = 0,
) -> list[dict]:
    provider = _provider(db, user)
    query = (
        db.query(Quotation, ServiceRequest)
        .join(ServiceRequest, ServiceRequest.request_id == Quotation.request_id)
        .filter(Quotation.provider_id == provider.provider_id)
    )
    if status == "cancelled":
        query = query.filter(ServiceRequest.status == RequestStatus.CANCELLED)
    elif status is not None:
        query = query.filter(
            Quotation.status == QuotationStatus(status),
            ServiceRequest.status != RequestStatus.CANCELLED,
        )
    query = query.order_by(Quotation.created_at.desc(), Quotation.quotation_id.desc())
    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    return [
        {
            "quotationId": quote.quotation_id,
            "requestId": request.request_id,
            "requestTitle": request.title,
            "requestStatus": request.status.value,
            "address": request.address,
            "urgency": request.urgency.value,
            "status": quote.status.value,
            "effectiveStatus": _effective_status(quote, request),
            "proposedPrice": float(quote.proposed_price),
            "estimatedDurationHours": (
                float(quote.estimated_duration_hours)
                if quote.estimated_duration_hours is not None
                else None
            ),
            "availableFrom": quote.available_from,
            "message": quote.message,
            "createdAt": quote.created_at,
        }
        for quote, request in query.all()
    ]


# ---------- dashboard ----------

def dashboard(db: Session, user: User) -> dict:
    provider = _provider(db, user)
    pid = provider.provider_id

    rating, review_count = (
        db.query(func.avg(Review.rating), func.count(Review.review_id))
        .filter(Review.reviewee_id == pid)
        .one()
    )

    quotations = {key: 0 for key in QUOTATION_FILTERS}
    rows = (
        db.query(Quotation.status, ServiceRequest.status, func.count(Quotation.quotation_id))
        .join(ServiceRequest, ServiceRequest.request_id == Quotation.request_id)
        .filter(Quotation.provider_id == pid)
        .group_by(Quotation.status, ServiceRequest.status)
        .all()
    )
    for quote_status, request_status, count in rows:
        key = "cancelled" if request_status == RequestStatus.CANCELLED else quote_status.value
        quotations[key] += count

    jobs = {key: 0 for key in _JOB_KEYS.values()}
    for request_status, count in (
        db.query(ServiceRequest.status, func.count(ServiceRequest.request_id))
        .filter(ServiceRequest.selected_provider_id == pid)
        .group_by(ServiceRequest.status)
        .all()
    ):
        if request_status in _JOB_KEYS:
            jobs[_JOB_KEYS[request_status]] = count

    category_ids = sorted(c.category_id for c in provider.service_categories)
    open_available = 0
    if category_ids:
        already_quoted = select(Quotation.request_id).where(Quotation.provider_id == pid)
        open_available = (
            db.query(func.count(ServiceRequest.request_id))
            .filter(
                ServiceRequest.status == RequestStatus.OPEN,
                ServiceRequest.category_id.in_(category_ids),
                ~ServiceRequest.request_id.in_(already_quoted),
            )
            .scalar()
        )

    completed_value = (
        db.query(func.coalesce(func.sum(Quotation.proposed_price), 0))
        .join(ServiceRequest, ServiceRequest.request_id == Quotation.request_id)
        .filter(
            Quotation.provider_id == pid,
            Quotation.status == QuotationStatus.ACCEPTED,
            ServiceRequest.selected_provider_id == pid,
            ServiceRequest.status == RequestStatus.COMPLETED,
        )
        .scalar()
    )

    return {
        "approvalStatus": provider.approval_status.value,
        "canQuote": provider.approval_status == ApprovalStatus.APPROVED,
        "categoryCount": len(category_ids),
        "rating": round(float(rating), 2) if rating is not None else None,
        "reviewCount": review_count,
        "responseTimeMinutes": provider.response_time_minutes,
        "openJobsAvailable": open_available,
        "quotations": quotations,
        "jobs": jobs,
        "completedJobsValue": float(completed_value or 0),
        "activeJobs": _job_items(db, pid, _ACTIVE, limit=5),
    }


# ---------- job progress ----------

def _transition(
    db: Session,
    user: User,
    request_id: int,
    *,
    expected: RequestStatus,
    new: RequestStatus,
    error: str,
    event_type: str,
    title: str,
    message: str,
) -> dict:
    _provider(db, user)
    request = db.get(ServiceRequest, request_id)
    if request is None or request.selected_provider_id != user.user_id:
        raise HTTPException(status_code=404, detail="Job not found")
    if request.status != expected:
        raise HTTPException(status_code=409, detail=error)

    request.status = new
    db.add(
        Notification(
            user_id=request.customer_id,
            related_request_id=request.request_id,
            event_type=event_type,
            title=title,
            message=message,
            channel=NotificationChannel.IN_APP,
            delivery_status=DeliveryStatus.PENDING,
        )
    )
    db.commit()
    return _job_items(db, user.user_id, request_id=request_id)[0]


def start_job(db: Session, user: User, request_id: int) -> dict:
    return _transition(
        db,
        user,
        request_id,
        expected=RequestStatus.ASSIGNED,
        new=RequestStatus.IN_PROGRESS,
        error="Only assigned jobs can be started",
        event_type="job_started",
        title="Your job has started",
        message="The provider has started working on your request.",
    )


def complete_job(db: Session, user: User, request_id: int) -> dict:
    return _transition(
        db,
        user,
        request_id,
        expected=RequestStatus.IN_PROGRESS,
        new=RequestStatus.COMPLETED,
        error="Only jobs in progress can be completed",
        event_type="job_completed",
        title="Your job was completed",
        message="The provider marked your request as completed. You can now leave a review.",
    )