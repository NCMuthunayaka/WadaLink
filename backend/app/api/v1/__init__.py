from fastapi import APIRouter
from app.api.v1.equipment import router as equipment_router
from app.api.v1.reservations import router as reservations_router

api_v1_router = APIRouter()
api_v1_router.include_router(equipment_router)
api_v1_router.include_router(reservations_router)
