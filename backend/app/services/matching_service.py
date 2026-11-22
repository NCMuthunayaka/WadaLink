from math import asin, cos, radians, sin, sqrt
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.provider import ApprovalStatus, Provider
from app.models.provider_score import ProviderScore
from app.models.review import Review
from app.models.service_request import ServiceRequest
from app.models.user import User

WEIGHTS = {"rating": 0.35, "proximity": 0.25, "response": 0.15, "price": 0.15, "experience": 0.10}


def _distance(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None
    d_lat, d_lon = radians(float(lat2) - float(lat1)), radians(float(lon2) - float(lon1))
    a = sin(d_lat / 2) ** 2 + cos(radians(float(lat1))) * cos(radians(float(lat2))) * sin(d_lon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


class MatchingService:
    @staticmethod
    def match(db: Session, request: ServiceRequest) -> dict:
        query = db.query(Provider, User).join(User, User.user_id == Provider.provider_id).filter(
            Provider.approval_status == ApprovalStatus.APPROVED,
            User.account_status == "active",
        )
        if request.category_id:
            query = query.filter(Provider.service_categories.any(category_id=request.category_id))
        rows = query.all()
        results = []
        for provider, user in rows:
            rating, count = db.query(func.avg(Review.rating), func.count(Review.review_id)).filter(Review.reviewee_id == provider.provider_id).one()
            rating = float(rating or 0)
            distance = _distance(request.latitude, request.longitude, provider.latitude, provider.longitude)
            if distance is not None and distance > float(provider.service_radius_km):
                continue
            components = {
                "rating": rating / 5,
                "proximity": 1 if distance is None else max(0, 1 - distance / max(float(provider.service_radius_km), 1)),
                "response": max(0, 1 - provider.response_time_minutes / 240),
                "price": 1 if not provider.hourly_rate or not request.budget_max else max(0, 1 - float(provider.hourly_rate) / float(request.budget_max)),
                "experience": min(1, provider.experience_years / 20),
            }
            total = sum(components[k] * WEIGHTS[k] for k in WEIGHTS)
            results.append((total, provider, user, rating, count, distance, components))
        results.sort(key=lambda row: row[0], reverse=True)
        response = []
        for rank, (total, provider, user, rating, count, distance, components) in enumerate(results[:20], 1):
            existing = db.query(ProviderScore).filter_by(request_id=request.request_id, provider_id=provider.provider_id).first()
            score = existing or ProviderScore(request_id=request.request_id, provider_id=provider.provider_id)
            score.rating_score = components["rating"]
            score.distance_score = components["proximity"]
            score.response_time_score = components["response"]
            score.price_score = components["price"]
            score.experience_score = components["experience"]
            score.total_score, score.rank_position = total, rank
            score.score_explanation = {"weights": WEIGHTS, "distanceKm": distance, "components": components}
            db.add(score)
            response.append({"providerId": provider.provider_id, "name": user.full_name, "businessName": provider.business_name, "experienceYears": provider.experience_years, "rating": rating, "reviewCount": count, "verified": provider.approval_status == ApprovalStatus.APPROVED, "distanceKm": distance, "responseMinutes": provider.response_time_minutes, "hourlyRate": float(provider.hourly_rate) if provider.hourly_rate else None, "rank": rank, "score": {"total": total, **{k: v for k, v in components.items()}}})
        db.commit()
        return {"requestId": request.request_id, "weights": WEIGHTS, "providers": response}

