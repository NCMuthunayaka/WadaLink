from fastapi import APIRouter
from app.routes.auth_routes import router as auth_router
from app.api.v1.equipment import router as equipment_router
from app.api.v1.reservations import router as reservations_router
from app.api.v1.classification import router as classification_router
from app.api.v1.matching import router as matching_router
from app.api.v1.requests import router as requests_router
from app.api.v1.ai_admin import router as ai_admin_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(equipment_router)
api_v1_router.include_router(reservations_router)
api_v1_router.include_router(classification_router)
api_v1_router.include_router(matching_router)
api_v1_router.include_router(requests_router)
api_v1_router.include_router(ai_admin_router)
