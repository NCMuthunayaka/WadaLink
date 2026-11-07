from fastapi import FastAPI
from app.routes.auth_routes import router as auth_router

app = FastAPI(
    title="WedaLink API",
    description="AI Service Marketplace and Equipment Rental API",
    version="1.0.0",
)

app.include_router(
    auth_router,
    prefix="/api",
)

@app.get("/health")
def health():
    return {"status": "ok"}
