from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationChannel, DeliveryStatus
from app.models.provider import ApprovalStatus, Provider
from app.models.quotation import Quotation, QuotationStatus
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User
from app.schemas.quotation import QuotationCreate, quotation_response


def submit(db: Session, payload: QuotationCreate, user: User):
    provider = db.get(Provider, user.user_id)
    request = db.get(ServiceRequest, payload.request_id)
    if not provider or provider.approval_status != ApprovalStatus.APPROVED:
        raise HTTPException(403, 'Only approved providers may submit quotations')
    if not request or request.status != RequestStatus.OPEN:
        raise HTTPException(404, 'Open service request not found')
    if db.query(Quotation).filter_by(request_id=request.request_id, provider_id=user.user_id).first():
        raise HTTPException(409, 'You already submitted a quotation for this request')
    quote = Quotation(provider_id=user.user_id, request_id=request.request_id, proposed_price=payload.proposed_price,
                      estimated_duration_hours=payload.estimated_duration_hours, available_from=payload.available_from,
                      message=payload.message)
    db.add(quote)
    db.flush()
    db.add(Notification(user_id=request.customer_id, related_request_id=request.request_id, event_type='quote_received',
                        title='New quotation received', message='A provider sent a quotation for your request.',
                        channel=NotificationChannel.IN_APP, delivery_status=DeliveryStatus.PENDING))
    db.commit(); db.refresh(quote)
    return quotation_response(quote)


def list_for_customer(db: Session, request_id: int, user: User):
    request = db.get(ServiceRequest, request_id)
    if not request or request.customer_id != user.user_id:
        raise HTTPException(404, 'Service request not found')
    return [quotation_response(q) for q in db.query(Quotation).filter_by(request_id=request_id).order_by(Quotation.proposed_price).all()]


def select(db: Session, request_id: int, quotation_id: int, user: User):
    request = db.get(ServiceRequest, request_id)
    quote = db.get(Quotation, quotation_id)
    if not request or request.customer_id != user.user_id or not quote or quote.request_id != request_id:
        raise HTTPException(404, 'Quotation not found')
    if request.status != RequestStatus.OPEN:
        raise HTTPException(409, 'Only open requests may select a provider')
    for item in db.query(Quotation).filter(Quotation.request_id == request_id):
        item.status = QuotationStatus.ACCEPTED if item.quotation_id == quotation_id else QuotationStatus.REJECTED
    request.selected_provider_id = quote.provider_id
    request.status = RequestStatus.ASSIGNED
    db.add(Notification(user_id=quote.provider_id, related_request_id=request_id, event_type='provider_selected',
                        title='Your quotation was selected', message='The customer selected your quotation.',
                        channel=NotificationChannel.IN_APP, delivery_status=DeliveryStatus.PENDING))
    db.commit(); db.refresh(quote)
    return quotation_response(quote)
