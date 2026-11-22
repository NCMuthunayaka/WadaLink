from pydantic import BaseModel, Field


class RequestCreate(BaseModel):
    categoryId: int | None = None
    title: str = Field(max_length=200)
    description: str = Field(min_length=3, max_length=10000)
    urgency: str = "medium"
    address: str = Field(max_length=255)
    latitude: float | None = None
    longitude: float | None = None


def request_response(request):
    return {
        "id": str(request.request_id),
        "customerId": str(request.customer_id),
        "categoryId": str(request.category_id) if request.category_id else None,
        "title": request.title,
        "description": request.description,
        "urgency": request.urgency.value,
        "address": request.address,
        "latitude": float(request.latitude) if request.latitude is not None else None,
        "longitude": float(request.longitude) if request.longitude is not None else None,
        "status": request.status.value,
        "createdAt": request.created_at.isoformat() if request.created_at else None,
        "updatedAt": request.updated_at.isoformat() if request.updated_at else None,
    }

