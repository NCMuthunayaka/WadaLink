from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest, UrgencyLevel
from app.schemas.request_api import RequestCreate, request_response
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
        status=RequestStatus.OPEN,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    try:
        ClassificationService.classify_request(db, request)
    except Exception:
        # Request was committed above; optional AI must not undo it.
        db.rollback()
    db.refresh(request)
    return request_response(request)


@router.get('')
def own_requests(db: Session = Depends(get_db), user: User = Depends(require_role('customer'))):
    return [request_response(row) for row in db.query(ServiceRequest).filter(ServiceRequest.customer_id == user.user_id).all()]


@router.get("/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db), user: User = Depends(require_role('customer'))):
    request = db.get(ServiceRequest, request_id)
    if request is None or request.customer_id != user.user_id:
        raise HTTPException(status_code=404, detail="Service request not found")
    return request_response(request)


@router.patch('/{request_id}')
def update_request(request_id: int, payload: RequestCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role('customer'))):
    request = db.get(ServiceRequest, request_id)
    if request is None or request.customer_id != current_user.user_id:
        raise HTTPException(status_code=404, detail='Request not found')
    if request.status != RequestStatus.OPEN:
        raise HTTPException(status_code=409, detail='Only open requests may be edited')
    category = db.get(ServiceCategory, payload.categoryId) if payload.categoryId else None
    if payload.categoryId is not None and (category is None or not category.is_active):
        raise HTTPException(status_code=400, detail='Invalid category')
    for field in ('title', 'description', 'address', 'latitude', 'longitude'):
        setattr(request, field, getattr(payload, field))
    request.category_id = payload.categoryId
    request.urgency = UrgencyLevel(payload.urgency)
    from app.models.classification_log import ClassificationLog, ClassificationStatus
    db.add(ClassificationLog(request=request, category=category, predicted_urgency=request.urgency, model_name='manual', model_version='manual', layer='user', confidence_score=1 if category else 0, status=ClassificationStatus.SUCCESS if category else ClassificationStatus.FALLBACK, output_json={'safetyTips': []}))
    db.commit()
    db.refresh(request)
    return request_response(request)

