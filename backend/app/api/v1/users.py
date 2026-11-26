from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.profile_schema import (
    AccountDeleteRequest,
    PasswordChange,
    ProfileUpdate,
    ProviderCategoriesUpdate,
    ProviderProfileUpdate,
)
from app.services import profile_service

router = APIRouter(prefix='/users', tags=['Profiles'])


@router.get('/me')
def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return profile_service.get_profile(db, user)


@router.patch('/me')
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return profile_service.update_profile(db, user, payload)


@router.patch('/me/provider')
def update_provider(payload: ProviderProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return profile_service.update_provider_profile(db, user, payload)


@router.get('/me/provider/categories')
def get_my_categories(db: Session = Depends(get_db), user: User = Depends(require_role('provider'))):
    return profile_service.get_provider_categories(db, user)


@router.put('/me/provider/categories')
def set_my_categories(payload: ProviderCategoriesUpdate, db: Session = Depends(get_db), user: User = Depends(require_role('provider'))):
    return profile_service.set_provider_categories(db, user, payload.categoryIds)


@router.post('/me/password', status_code=204)
def change_password(payload: PasswordChange, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile_service.change_password(db, user, payload.current_password, payload.new_password)
    return Response(status_code=204)


@router.delete('/me', status_code=204)
def delete_account(payload: AccountDeleteRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile_service.delete_account(db, user, payload.password)
    return Response(status_code=204)


@router.get('/providers/{provider_id}')
def get_provider_public(provider_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return profile_service.get_public_provider(db, provider_id)