from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.quotation import QuotationCreate, QuotationResponse
from app.services.quotation_service import list_for_customer, select, submit

router = APIRouter(prefix='/quotations', tags=['Quotations'])


@router.post('', response_model=QuotationResponse, status_code=201)
def create_quotation(payload: QuotationCreate, db: Session = Depends(get_db), user: User = Depends(require_role('provider'))):
    return submit(db, payload, user)


@router.get('/request/{request_id}', response_model=list[QuotationResponse])
def get_quotations(request_id: int, db: Session = Depends(get_db), user: User = Depends(require_role('customer'))):
    return list_for_customer(db, request_id, user)


@router.post('/request/{request_id}/select/{quotation_id}', response_model=QuotationResponse)
def select_quotation(request_id: int, quotation_id: int, db: Session = Depends(get_db), user: User = Depends(require_role('customer'))):
    return select(db, request_id, quotation_id, user)
