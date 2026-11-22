from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.admin_log import AdminLog
from app.models.equipment import Equipment
from app.models.provider import ApprovalStatus, Provider
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User

router = APIRouter(prefix='/admin', tags=['Administration'])

@router.get('/dashboard')
def dashboard(db: Session = Depends(get_db), _: User = Depends(require_role('admin'))):
    return {'activeJobs': db.query(ServiceRequest).filter(ServiceRequest.status.in_([RequestStatus.ASSIGNED, RequestStatus.IN_PROGRESS])).count(), 'pendingApprovals': db.query(Provider).filter(Provider.approval_status == ApprovalStatus.PENDING).count(), 'openRequests': db.query(ServiceRequest).filter(ServiceRequest.status == RequestStatus.OPEN).count(), 'equipmentListings': db.query(Equipment).count()}

@router.get('/providers/pending')
def pending_providers(db: Session = Depends(get_db), _: User = Depends(require_role('admin'))):
    rows = db.query(Provider, User).join(User, User.user_id == Provider.provider_id).filter(Provider.approval_status == ApprovalStatus.PENDING).all()
    return [{'providerId': p.provider_id, 'name': u.full_name, 'email': u.email, 'businessName': p.business_name, 'createdAt': p.created_at} for p, u in rows]

@router.post('/providers/{provider_id}/{decision}')
def decide_provider(provider_id: int, decision: str, db: Session = Depends(get_db), admin: User = Depends(require_role('admin'))):
    provider = db.get(Provider, provider_id)
    if not provider or decision not in {'approve', 'reject'}: raise HTTPException(404, 'Provider or decision not found')
    provider.approval_status = ApprovalStatus.APPROVED if decision == 'approve' else ApprovalStatus.REJECTED
    provider.approved_by = admin.user_id if decision == 'approve' else None
    db.add(AdminLog(admin_id=admin.user_id, action_type=f'provider_{decision}', target_type='provider', target_id=provider_id))
    db.commit()
    return {'providerId': provider_id, 'approvalStatus': provider.approval_status}

@router.get('/listings')
def listings(db: Session = Depends(get_db), _: User = Depends(require_role('admin'))):
    return {'serviceRequests': [{'id': r.request_id, 'title': r.title, 'status': r.status.value} for r in db.query(ServiceRequest).order_by(ServiceRequest.created_at.desc()).limit(100)], 'equipment': [{'id': e.equipment_id, 'name': e.equipment_name, 'status': e.status.value} for e in db.query(Equipment).order_by(Equipment.created_at.desc()).limit(100)]}
