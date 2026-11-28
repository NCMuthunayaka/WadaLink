from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.ai_review import CategoryProposal, LabeledRequest, ReviewQueueStatus, UnmatchedRequest
from app.models.classification_log import ClassificationLog, ClassificationStatus
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest
from app.models.user import User
from app.models.admin_log import AdminLog
from app.models.notification import Notification
from pydantic import BaseModel, Field
from typing import Literal


class ReviewDecision(BaseModel):
    category: str | None = None
    reason: str | None = None


class ProposalCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = None


class UnmatchedDecision(BaseModel):
    decision: Literal["assign", "close"]
    categoryId: int | None = None


router = APIRouter(prefix="/admin/ai", tags=["AI Administration"])


@router.get("/review-queue")
def review_queue(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))):
    return [{"id": item.labeled_id, "requestId": item.request_id, "text": item.input_text, "suggestedCategory": item.suggested_category, "confidence": item.confidence, "status": item.status} for item in db.query(LabeledRequest).filter(LabeledRequest.status == ReviewQueueStatus.PENDING).all()]


@router.get("/stats")
def review_stats(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))):
    return {
        "pendingReviews": db.query(LabeledRequest).filter(LabeledRequest.status == ReviewQueueStatus.PENDING).count(),
        "approvedReviews": db.query(LabeledRequest).filter(LabeledRequest.status == ReviewQueueStatus.APPROVED).count(),
        "rejectedReviews": db.query(LabeledRequest).filter(LabeledRequest.status == ReviewQueueStatus.REJECTED).count(),
        "pendingCategoryProposals": db.query(CategoryProposal).filter(CategoryProposal.status == ReviewQueueStatus.PENDING).count(),
        "pendingUnmatchedRequests": db.query(UnmatchedRequest).filter(UnmatchedRequest.status == "pending").count(),
    }


@router.get("/unmatched-requests")
def unmatched_requests(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))):
    rows = db.query(UnmatchedRequest).filter(
        UnmatchedRequest.status == "pending"
    ).order_by(UnmatchedRequest.created_at.asc(), UnmatchedRequest.unmatched_id.asc()).limit(100).all()
    return [
        {
            "id": item.unmatched_id,
            "requestId": item.request_id,
            "text": item.input_text,
            "reason": item.reason,
            "createdAt": item.created_at,
        }
        for item in rows
    ]


@router.post("/unmatched-requests/{item_id}/review")
def review_unmatched_request(
    item_id: int,
    payload: UnmatchedDecision,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    item = db.query(UnmatchedRequest).filter(
        UnmatchedRequest.unmatched_id == item_id
    ).with_for_update().first()
    if item is None:
        raise HTTPException(status_code=404, detail="Unmatched request not found")
    if item.status != "pending":
        raise HTTPException(status_code=409, detail="Unmatched request was already reviewed")

    request = db.get(ServiceRequest, item.request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Service request not found")

    category = None
    if payload.decision == "assign":
        if payload.categoryId is None:
            raise HTTPException(status_code=422, detail="Choose an active category")
        category = db.get(ServiceCategory, payload.categoryId)
        if category is None or not category.is_active:
            raise HTTPException(status_code=422, detail="Choose an active category")
        request.category_id = category.category_id
        db.add(ClassificationLog(
            request_id=request.request_id,
            category_id=category.category_id,
            predicted_urgency=request.urgency,
            model_name="admin-review",
            model_version="admin-review",
            layer="admin",
            confidence_score=1.0,
            input_text=item.input_text,
            output_json={
                "categories": [],
                "reason": "Category assigned during admin review.",
                "safetyTips": [],
            },
            status=ClassificationStatus.SUCCESS,
        ))
        labeled = db.query(LabeledRequest).filter(
            LabeledRequest.request_id == request.request_id
        ).order_by(LabeledRequest.created_at.desc()).first()
        if labeled is None:
            labeled = LabeledRequest(
                request_id=request.request_id,
                input_text=item.input_text,
                suggested_category=category.category_name,
                confidence=1.0,
            )
        labeled.suggested_category = category.category_name
        labeled.confidence = 1.0
        labeled.status = ReviewQueueStatus.APPROVED
        labeled.reviewed_by = admin.user_id
        db.add(labeled)
        item.status = "resolved"
        notification_title = "Service request reviewed"
        notification_message = f'Your request is now categorized as "{category.category_name}" and can be matched with providers.'
    else:
        request.status = RequestStatus.CANCELLED
        item.status = "closed"
        notification_title = "Service request closed"
        notification_message = "We could not match this request to a supported service, so it was closed. You can create a new request if you selected the wrong option."

    item.reviewed_by = admin.user_id
    item.reviewed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.add(Notification(
        user_id=request.customer_id,
        related_request_id=request.request_id,
        event_type=f"unmatched_request_{payload.decision}",
        title=notification_title,
        message=notification_message,
    ))
    db.add(AdminLog(
        admin_id=admin.user_id,
        action_type=f"unmatched_request_{payload.decision}",
        target_type="unmatched_request",
        target_id=item.unmatched_id,
    ))
    db.commit()
    return {
        "id": item.unmatched_id,
        "requestId": request.request_id,
        "status": item.status,
        "categoryId": category.category_id if category else None,
    }


@router.get('/approved-export')
def approved_export(db: Session = Depends(get_db), _: User = Depends(require_role('admin'))):
    import csv
    import io
    from fastapi.responses import Response
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=['text', 'category', 'status'])
    writer.writeheader()
    for item in db.query(LabeledRequest).filter(LabeledRequest.status == ReviewQueueStatus.APPROVED).all():
        writer.writerow({'text': item.input_text, 'category': item.suggested_category.strip().lower().replace(' ', '_'), 'status': 'approved'})
    return Response(output.getvalue(), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename=approved_labels.csv'})


@router.post("/review-queue/{item_id}/{decision}")
def decide_review(item_id: int, decision: str, payload: ReviewDecision | None = None, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    item = db.get(LabeledRequest, item_id)
    if not item or decision not in {"approve", "reject"}:
        raise HTTPException(status_code=404, detail="Review item or decision not found")
    category_name = payload.category if payload and payload.category else item.suggested_category
    if decision == 'approve' and category_name != 'other' and not db.query(ServiceCategory).filter(ServiceCategory.category_name == category_name, ServiceCategory.is_active.is_(True)).first():
        raise HTTPException(status_code=422, detail='Choose an active category or other')
    item.status = ReviewQueueStatus.APPROVED if decision == "approve" else ReviewQueueStatus.REJECTED
    old_category = item.suggested_category
    if payload and payload.category:
        item.suggested_category = payload.category
    item.reviewed_by = admin.user_id
    reason = payload.reason if payload else None
    if payload and payload.category and payload.category != old_category:
        reason = f"category correction: {old_category} -> {payload.category}; {reason or ''}".strip()
    db.add(AdminLog(admin_id=admin.user_id, action_type=f"ai_review_{decision}", target_type="llm_labeled_request", target_id=item.labeled_id, reason=reason))
    db.commit()
    return {"id": item.labeled_id, "status": item.status}


@router.get("/category-proposals")
def category_proposals(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))):
    return [{"id": p.proposal_id, "name": p.name, "description": p.description, "status": p.status} for p in db.query(CategoryProposal).order_by(CategoryProposal.created_at.desc()).all()]


@router.post("/category-proposals")
def create_category_proposal(payload: ProposalCreate, db: Session = Depends(get_db), admin: User = Depends(require_role("admin", "provider"))):
    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail='Category name is too short')
    if db.query(CategoryProposal).filter(func.lower(CategoryProposal.name) == name.lower()).first() or db.query(ServiceCategory).filter(func.lower(ServiceCategory.category_name) == name.lower()).first():
        raise HTTPException(status_code=409, detail="Category already exists or has already been proposed")
    if db.query(CategoryProposal).filter(CategoryProposal.proposed_by == admin.user_id, CategoryProposal.created_at >= datetime.utcnow() - timedelta(days=7)).count() >= 20:
        raise HTTPException(status_code=429, detail="Weekly category proposal limit reached")
    proposal = CategoryProposal(name=name, description=payload.description, proposed_by=admin.user_id)
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return {"id": proposal.proposal_id, "name": proposal.name, "description": proposal.description, "status": proposal.status}


@router.post("/category-proposals/{proposal_id}/{decision}")
def decide_category(proposal_id: int, decision: str, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    proposal = db.get(CategoryProposal, proposal_id)
    if not proposal or decision not in {"approve", "reject"}:
        raise HTTPException(status_code=404, detail="Proposal or decision not found")
    proposal.status = ReviewQueueStatus.APPROVED if decision == "approve" else ReviewQueueStatus.REJECTED
    if decision == "approve" and not db.query(ServiceCategory).filter(ServiceCategory.category_name == proposal.name).first():
        db.add(ServiceCategory(category_name=proposal.name, description=proposal.description, is_active=True))
    db.add(AdminLog(admin_id=admin.user_id, action_type=f"category_proposal_{decision}", target_type="category_proposal", target_id=proposal.proposal_id))
    db.commit()
    return {"id": proposal.proposal_id, "status": proposal.status}
