from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.classification_log import ClassificationLog
from app.models.service_request import ServiceRequest
from app.schemas.classification import ClassificationResponse
from app.services.classification_service import ClassificationService

router = APIRouter(prefix="/requests", tags=["AI Classification"])


@router.post("/{request_id}/classify", response_model=ClassificationResponse)
def classify_request(request_id: int, db: Session = Depends(get_db)):
    request = db.get(ServiceRequest, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")
    return ClassificationService.response(ClassificationService.classify_request(db, request))


@router.get("/{request_id}/classification", response_model=ClassificationResponse)
def get_classification(request_id: int, db: Session = Depends(get_db)):
    log = db.query(ClassificationLog).filter(
        ClassificationLog.request_id == request_id
    ).order_by(ClassificationLog.created_at.desc()).first()
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No classification exists for this request")
    return ClassificationService.response(log)

