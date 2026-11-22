from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix='/notifications', tags=['Notifications'])
def item(n): return {'id': n.notification_id, 'type': n.event_type, 'title': n.title, 'body': n.message or '', 'createdAt': n.created_at, 'read': n.is_read}
@router.get('')
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [item(n) for n in db.query(Notification).filter_by(user_id=user.user_id).order_by(Notification.created_at.desc()).limit(100).all()]
@router.post('/{notification_id}/read')
def mark_read(notification_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notification = db.query(Notification).filter_by(notification_id=notification_id, user_id=user.user_id).first()
    if notification: notification.is_read = True; db.commit()
    return {'id': notification_id, 'read': True}
