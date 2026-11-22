from fastapi import APIRouter
from app.routes.auth_routes import router as auth_router
from app.api.v1.equipment import router as equipment_router
from app.api.v1.reservations import router as reservations_router
from app.api.v1.classification import router as classification_router
from app.api.v1.matching import router as matching_router
from app.api.v1.requests import router as requests_router
from app.api.v1.ai_admin import router as ai_admin_router
from app.api.v1.quotations import router as quotations_router
from app.api.v1.users import router as users_router
from app.api.v1.providers import router as providers_router
from app.api.v1.chat import router as chat_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(equipment_router)
api_v1_router.include_router(reservations_router)
api_v1_router.include_router(classification_router)
api_v1_router.include_router(matching_router)
api_v1_router.include_router(requests_router)
api_v1_router.include_router(ai_admin_router)
api_v1_router.include_router(quotations_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(providers_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(reviews_router)
api_v1_router.include_router(admin_router)
