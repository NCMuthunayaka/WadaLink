from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.customer import Customer
from app.models.provider import Provider
from app.models.user import User

router = APIRouter(prefix='/users', tags=['Profiles'])

class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)

class ProviderProfileUpdate(ProfileUpdate):
    business_name: str | None = Field(default=None, max_length=150)
    bio: str | None = Field(default=None, max_length=5000)
    experience_years: int = Field(default=0, ge=0, le=100)
    hourly_rate: Decimal | None = Field(default=None, ge=0)
    service_radius_km: Decimal = Field(default=10, ge=0, le=1000)

def profile(user, customer=None, provider=None):
    data = {'userId': user.user_id, 'name': user.full_name, 'email': user.email, 'phone': user.phone, 'role': user.role.value, 'accountStatus': user.account_status.value}
    owner = customer or provider
    if owner: data.update({'address': getattr(owner, 'address', None), 'latitude': str(getattr(owner, 'latitude', None)) if getattr(owner, 'latitude', None) is not None else None, 'longitude': str(getattr(owner, 'longitude', None)) if getattr(owner, 'longitude', None) is not None else None})
    if provider: data.update({'businessName': provider.business_name, 'bio': provider.bio, 'experienceYears': provider.experience_years, 'hourlyRate': float(provider.hourly_rate) if provider.hourly_rate is not None else None, 'serviceRadiusKm': float(provider.service_radius_km), 'approvalStatus': provider.approval_status.value})
    return data

@router.get('/me')
def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return profile(user, db.get(Customer, user.user_id), db.get(Provider, user.user_id))

@router.patch('/me')
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user.full_name, user.phone = payload.full_name.strip(), payload.phone
    owner = db.get(Customer, user.user_id) or db.get(Provider, user.user_id)
    if owner: owner.address, owner.latitude, owner.longitude = payload.address, payload.latitude, payload.longitude
    db.commit(); db.refresh(user)
    return profile(user, db.get(Customer, user.user_id), db.get(Provider, user.user_id))

@router.patch('/me/provider')
def update_provider(payload: ProviderProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    provider = db.get(Provider, user.user_id)
    if not provider: raise HTTPException(403, 'Provider profile required')
    user.full_name, user.phone = payload.full_name.strip(), payload.phone
    provider.business_name, provider.bio = payload.business_name, payload.bio
    provider.experience_years, provider.hourly_rate, provider.service_radius_km = payload.experience_years, payload.hourly_rate, payload.service_radius_km
    provider.latitude, provider.longitude = payload.latitude, payload.longitude
    db.commit(); db.refresh(user)
    return profile(user, None, provider)
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.customer import Customer
from app.models.provider import Provider
from app.models.user import User

router = APIRouter(prefix='/users', tags=['Profiles'])

class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)

class ProviderProfileUpdate(ProfileUpdate):
    business_name: str | None = Field(default=None, max_length=150)
    bio: str | None = Field(default=None, max_length=5000)
    experience_years: int = Field(default=0, ge=0, le=100)
    hourly_rate: Decimal | None = Field(default=None, ge=0)
    service_radius_km: Decimal = Field(default=10, ge=0, le=1000)

def profile(user, customer=None, provider=None):
    data = {'userId': user.user_id, 'name': user.full_name, 'email': user.email, 'phone': user.phone, 'role': user.role.value, 'accountStatus': user.account_status.value}
    owner = customer or provider
    if owner: data.update({'address': getattr(owner, 'address', None), 'latitude': str(getattr(owner, 'latitude', None)) if getattr(owner, 'latitude', None) is not None else None, 'longitude': str(getattr(owner, 'longitude', None)) if getattr(owner, 'longitude', None) is not None else None})
    if provider: data.update({'businessName': provider.business_name, 'bio': provider.bio, 'experienceYears': provider.experience_years, 'hourlyRate': float(provider.hourly_rate) if provider.hourly_rate is not None else None, 'serviceRadiusKm': float(provider.service_radius_km), 'approvalStatus': provider.approval_status.value})
    return data

@router.get('/me')
def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return profile(user, db.get(Customer, user.user_id), db.get(Provider, user.user_id))

@router.patch('/me')
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user.full_name, user.phone = payload.full_name.strip(), payload.phone
    owner = db.get(Customer, user.user_id) or db.get(Provider, user.user_id)
    if owner: owner.address, owner.latitude, owner.longitude = payload.address, payload.latitude, payload.longitude
    db.commit(); db.refresh(user)
    return profile(user, db.get(Customer, user.user_id), db.get(Provider, user.user_id))

@router.patch('/me/provider')
def update_provider(payload: ProviderProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    provider = db.get(Provider, user.user_id)
    if not provider: raise HTTPException(403, 'Provider profile required')
    user.full_name, user.phone = payload.full_name.strip(), payload.phone
    provider.business_name, provider.bio = payload.business_name, payload.bio
    provider.experience_years, provider.hourly_rate, provider.service_radius_km = payload.experience_years, payload.hourly_rate, payload.service_radius_km
    provider.latitude, provider.longitude = payload.latitude, payload.longitude
    db.commit(); db.refresh(user)
    return profile(user, None, provider)
