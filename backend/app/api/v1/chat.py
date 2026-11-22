from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.message import Message
from app.models.service_request import ServiceRequest
from app.models.user import User

router = APIRouter(prefix='/chat', tags=['Chat'])
class MessageCreate(BaseModel): text: str = Field(min_length=1, max_length=4000)
def authorized(request, user): return user.user_id == request.customer_id or user.user_id == request.selected_provider_id
def payload(m): return {'id': m.message_id, 'requestId': m.request_id, 'senderId': m.sender_id, 'text': m.message_text, 'sentAt': m.sent_at}

@router.get('/{request_id}')
def messages(request_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = db.get(ServiceRequest, request_id)
    if not request or not request.selected_provider_id or not authorized(request, user): raise HTTPException(403, 'Chat is available only after provider selection')
    return [payload(m) for m in db.query(Message).filter_by(request_id=request_id).order_by(Message.sent_at).all()]

@router.post('/{request_id}', status_code=201)
def send(request_id: int, body: MessageCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = db.get(ServiceRequest, request_id)
    if not request or not request.selected_provider_id or not authorized(request, user): raise HTTPException(403, 'Chat is available only after provider selection')
    message = Message(request_id=request_id, sender_id=user.user_id, message_text=body.text.strip())
    db.add(message); db.commit(); db.refresh(message)
    return payload(message)
