from datetime import datetime
from math import asin, cos, radians, sin, sqrt

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.provider import ApprovalStatus, Provider
from app.models.quotation import Quotation
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User

_URGENCY_RANK = {"emergency": 0, "high": 1, "medium": 2, "low": 3}


def _distance_km(lat1, lon1, lat2, lon2):
    """Great-circle distance; None when either point has no coordinates."""
    if None in (lat1, lon1, lat2, lon2):
        return None
    d_lat = radians(float(lat2) - float(lat1))
    d_lon = radians(float(lon2) - float(lon1))
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(float(lat1))) * cos(radians(float(lat2))) * sin(d_lon / 2) ** 2
    )
    return 6371 * 2 * asin(sqrt(a))


def _category_names(db: Session, category_ids: set[int]) -> dict[int, str]:
    if not category_ids:
        return {}
    rows = db.query(ServiceCategory).filter(
        ServiceCategory.category_id.in_(sorted(category_ids))
    )
    return {c.category_id: c.category_name for c in rows}


def _job_item(request, provider, names, quote, quote_count, distance) -> dict:
    """Shared by the list and detail endpoints. Never exposes customer coordinates."""
    can_quote = (
        provider.approval_status == ApprovalStatus.APPROVED
        and request.status == RequestStatus.OPEN
        and quote is None
    )
    return {
        # existing keys (unchanged)
        "id": request.request_id,
        "title": request.title,
        "description": request.description,
        "address": request.address,
        "urgency": request.urgency.value,
        "categoryId": request.category_id,
        "createdAt": request.created_at,
        # new keys
        "categoryName": names.get(request.category_id),
        "budgetMin": float(request.budget_min) if request.budget_min is not None else None,
        "budgetMax": float(request.budget_max) if request.budget_max is not None else None,
        "distanceKm": round(distance, 2) if distance is not None else None,
        "withinServiceRadius": (
            None if distance is None else distance <= float(provider.service_radius_km)
        ),
        "quotationCount": quote_count,
        "alreadyQuoted": quote is not None,
        "quotationId": quote.quotation_id if quote else None,
        "quotationStatus": quote.status.value if quote else None,
        "canQuote": can_quote,
    }


def list_jobs(
    db: Session,
    user: User,
    *,
    category_id: int | None = None,
    urgency=None,
    max_distance_km: float | None = None,
    within_service_radius: bool = False,
    include_uncategorized: bool = False,
    sort: str = "newest",
    limit: int | None = None,
    offset: int = 0,
) -> list[dict]:
    provider = db.get(Provider, user.user_id)
    if provider is None:
        return []

    own_ids = {c.category_id for c in provider.service_categories}
    wanted = own_ids if category_id is None else own_ids & {category_id}

    conditions = []
    if wanted:
        conditions.append(ServiceRequest.category_id.in_(sorted(wanted)))
    if include_uncategorized and category_id is None:
        conditions.append(ServiceRequest.category_id.is_(None))
    if not conditions:
        return []

    query = db.query(ServiceRequest).filter(
        ServiceRequest.status == RequestStatus.OPEN, or_(*conditions)
    )
    if urgency is not None:
        query = query.filter(ServiceRequest.urgency == urgency)
    requests = query.all()
    if not requests:
        return []

    request_ids = [r.request_id for r in requests]
    my_quotes = {
        q.request_id: q
        for q in db.query(Quotation).filter(
            Quotation.provider_id == provider.provider_id,
            Quotation.request_id.in_(request_ids),
        )
    }
    counts = {
        row[0]: row[1]
        for row in db.query(Quotation.request_id, func.count(Quotation.quotation_id))
        .filter(Quotation.request_id.in_(request_ids))
        .group_by(Quotation.request_id)
        .all()
    }
    names = _category_names(db, {r.category_id for r in requests if r.category_id})

    items = []
    for request in requests:
        distance = _distance_km(
            request.latitude, request.longitude, provider.latitude, provider.longitude
        )
        if max_distance_km is not None and (distance is None or distance > max_distance_km):
            continue
        if (
            within_service_radius
            and distance is not None
            and distance > float(provider.service_radius_km)
        ):
            continue
        items.append(
            _job_item(
                request,
                provider,
                names,
                my_quotes.get(request.request_id),
                counts.get(request.request_id, 0),
                distance,
            )
        )

    # Newest first; the later sorts are stable, so ties keep this order.
    items.sort(key=lambda i: (i["createdAt"] or datetime.min, i["id"]), reverse=True)
    if sort == "urgency":
        items.sort(key=lambda i: _URGENCY_RANK[i["urgency"]])
    elif sort == "nearest":
        items.sort(key=lambda i: (i["distanceKm"] is None, i["distanceKm"] or 0))

    end = None if limit is None else offset + limit
    return items[offset:end]


def get_job(db: Session, user: User, request_id: int) -> dict:
    provider = db.get(Provider, user.user_id)
    request = db.get(ServiceRequest, request_id)
    if provider is None or request is None:
        raise HTTPException(status_code=404, detail="Job not found")

    quote = (
        db.query(Quotation)
        .filter(
            Quotation.request_id == request_id,
            Quotation.provider_id == provider.provider_id,
        )
        .first()
    )
    is_selected = request.selected_provider_id == provider.provider_id
    own_ids = {c.category_id for c in provider.service_categories}
    open_and_relevant = request.status == RequestStatus.OPEN and (
        request.category_id is None or request.category_id in own_ids
    )
    if not (open_and_relevant or quote is not None or is_selected):
        raise HTTPException(status_code=404, detail="Job not found")

    quote_count = (
        db.query(func.count(Quotation.quotation_id))
        .filter(Quotation.request_id == request_id)
        .scalar()
    )
    distance = _distance_km(
        request.latitude, request.longitude, provider.latitude, provider.longitude
    )
    names = _category_names(db, {request.category_id} if request.category_id else set())

    item = _job_item(request, provider, names, quote, quote_count, distance)
    item["status"] = request.status.value
    item["myQuotation"] = (
        {
            "id": quote.quotation_id,
            "status": quote.status.value,
            "proposedPrice": float(quote.proposed_price),
        }
        if quote
        else None
    )
    customer = db.get(User, request.customer_id) if is_selected else None
    item["customerName"] = customer.full_name if customer else None
    return item