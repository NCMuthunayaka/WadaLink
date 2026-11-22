from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.service_request import ServiceRequest
from app.schemas.matching import MatchResponse
from app.services.matching_service import MatchingService
from app.core.dependencies import require_role
from app.models.user import User

router = APIRouter(prefix="/requests", tags=["AI Matching"])


@router.post("/{request_id}/matches", response_model=MatchResponse)
def match_request(request_id: int, db: Session = Depends(get_db), user: User = Depends(require_role('customer'))):
    request = db.get(ServiceRequest, request_id)
    if request is None or request.customer_id != user.user_id:
        raise HTTPException(status_code=404, detail="Service request not found")
    return MatchingService.match(db, request)


@router.get("/{request_id}/matches", response_model=MatchResponse)
def get_matches(request_id: int, db: Session = Depends(get_db), user: User = Depends(require_role('customer'))):
    request = db.get(ServiceRequest, request_id)
    if request is None or request.customer_id != user.user_id:
        raise HTTPException(status_code=404, detail="Service request not found")
    return MatchingService.match(db, request)
