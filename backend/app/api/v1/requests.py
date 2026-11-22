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
    category = db.get(ServiceCategory, payload.categoryId)
    if category is None or not category.is_active:
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
    ClassificationService.classify_request(db, request)
    db.refresh(request)
    return request_response(request)


@router.get("/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db)):
    request = db.get(ServiceRequest, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Service request not found")
    return request_response(request)

