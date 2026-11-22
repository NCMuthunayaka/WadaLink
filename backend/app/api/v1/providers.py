from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.provider import Provider
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User

router = APIRouter(prefix='/providers', tags=['Provider Jobs'])

@router.get('/jobs')
def open_jobs(db: Session = Depends(get_db), user: User = Depends(require_role('provider'))):
    provider = db.get(Provider, user.user_id)
    if not provider: return []
    category_ids = {category.category_id for category in provider.service_categories}
    rows = db.query(ServiceRequest).filter(ServiceRequest.status == RequestStatus.OPEN).all()
    return [{'id': row.request_id, 'title': row.title, 'description': row.description, 'address': row.address, 'urgency': row.urgency.value, 'categoryId': row.category_id, 'createdAt': row.created_at} for row in rows if row.category_id in category_ids]
