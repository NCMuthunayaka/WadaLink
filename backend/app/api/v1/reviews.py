from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.review import Review
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User

router = APIRouter(prefix='/reviews', tags=['Reviews'])
class ReviewCreate(BaseModel): rating: int = Field(ge=1, le=5); comment: str | None = Field(default=None, max_length=2000)
def item(r): return {'id': r.review_id, 'requestId': r.request_id, 'reviewerId': r.reviewer_id, 'revieweeId': r.reviewee_id, 'rating': r.rating, 'comment': r.comment, 'createdAt': r.created_at}
@router.get('/request/{request_id}')
def list_reviews(request_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = db.get(ServiceRequest, request_id)
    if not request or (user.user_id != request.customer_id and user.user_id != request.selected_provider_id): raise HTTPException(403, 'Not a participant in this job')
    return [item(r) for r in db.query(Review).filter_by(request_id=request_id).all()]
@router.post('/request/{request_id}')
def create_review(request_id: int, body: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = db.get(ServiceRequest, request_id)
    if not request or request.status != RequestStatus.COMPLETED: raise HTTPException(409, 'Reviews are available after completion')
    if user.user_id == request.customer_id: reviewee = request.selected_provider_id
    elif user.user_id == request.selected_provider_id: reviewee = request.customer_id
    else: raise HTTPException(403, 'Not a participant in this job')
    if not reviewee: raise HTTPException(409, 'No review target exists')
    if db.query(Review).filter_by(request_id=request_id, reviewer_id=user.user_id).first(): raise HTTPException(409, 'You already reviewed this job')
    review = Review(request_id=request_id, reviewer_id=user.user_id, reviewee_id=reviewee, rating=body.rating, comment=body.comment)
    db.add(review); db.commit(); db.refresh(review)
    return item(review)
