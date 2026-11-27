from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.service_request import UrgencyLevel
from app.models.user import User
from app.services import provider_jobs_service

router = APIRouter(prefix='/providers', tags=['Provider Jobs'])


@router.get('/jobs')
def open_jobs(
    category_id: int | None = Query(default=None, alias='categoryId', ge=1),
    urgency: UrgencyLevel | None = Query(default=None),
    max_distance_km: float | None = Query(default=None, alias='maxDistanceKm', gt=0, le=1000),
    within_service_radius: bool = Query(default=False, alias='withinServiceRadius'),
    include_uncategorized: bool = Query(default=False, alias='includeUncategorized'),
    sort: Literal['newest', 'urgency', 'nearest'] = Query(default='newest'),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(require_role('provider')),
):
    return provider_jobs_service.list_jobs(
        db,
        user,
        category_id=category_id,
        urgency=urgency,
        max_distance_km=max_distance_km,
        within_service_radius=within_service_radius,
        include_uncategorized=include_uncategorized,
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.get('/jobs/{request_id}')
def job_detail(
    request_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role('provider')),
):
    return provider_jobs_service.get_job(db, user, request_id)