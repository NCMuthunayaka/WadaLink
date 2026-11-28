from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest, UrgencyLevel
from app.schemas.request_api import RequestCancel, RequestCreate, RequestUpdate, request_response
from app.services import request_service
from app.services.classification_service import ClassificationService
from app.models.user import User

router = APIRouter(prefix="/requests", tags=["Service Requests"])


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    return [
        {"id": str(category.category_id), "name": category.category_name, "description": category.description}
        for category in db.query(ServiceCategory).filter(ServiceCategory.is_active.is_(True)).order_by(ServiceCategory.category_name).all()
    ]


@router.post("")
def create_request(
    payload: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer")),
):
    category = db.get(ServiceCategory, payload.categoryId) if payload.categoryId else None
    if payload.categoryId is not None and (category is None or not category.is_active):
        raise HTTPException(status_code=400, detail="Invalid service category")
    request = ServiceRequest(
        customer_id=current_user.user_id,
        category_id=payload.categoryId,
        title=payload.title,
        description=payload.description,
        urgency=UrgencyLevel(payload.urgency),
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        budget_min=payload.budgetMin,
        budget_max=payload.budgetMax,
        status=RequestStatus.OPEN,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    try:
        ClassificationService.classify_request(
            db, request, require_manual_review=payload.manualReview
        )
    except Exception:
        # Request was committed above; optional AI must not undo it.
        db.rollback()
    db.refresh(request)
    return request_response(request)


@router.get('')
def own_requests(
    status: RequestStatus | None = Query(default=None, description="Filter by request status"),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(require_role('customer')),
):
    return request_service.list_own(db, user, status, limit, offset)


@router.get("/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db), user: User = Depends(require_role('customer'))):
    request = db.get(ServiceRequest, request_id)
    if request is None or request.customer_id != user.user_id:
        raise HTTPException(status_code=404, detail="Service request not found")
    return request_response(request)


@router.patch('/{request_id}')
def update_request(request_id: int, payload: RequestUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role('customer'))):
    return request_service.update_request(db, current_user, request_id, payload)


@router.post('/{request_id}/cancel')
def cancel_request(request_id: int, payload: RequestCancel | None = None, db: Session = Depends(get_db), current_user: User = Depends(require_role('customer'))):
    return request_service.cancel_request(db, current_user, request_id, payload.reason if payload else None)