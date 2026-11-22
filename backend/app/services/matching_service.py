from math import asin, cos, radians, sin, sqrt
import json
from pathlib import Path
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.provider import ApprovalStatus, Provider
from app.models.provider_score import ProviderScore
from app.models.review import Review
from app.models.service_request import ServiceRequest
from app.models.user import User
from app.models.quotation import Quotation

WEIGHTS = json.loads((Path(__file__).parents[1] / 'ranking' / 'weights.json').read_text())
if set(WEIGHTS) != {'rating', 'proximity', 'response', 'price', 'experience'} or any(v < 0 for v in WEIGHTS.values()) or abs(sum(WEIGHTS.values()) - 1) > 1e-9:
    raise ValueError('Ranking weights must be nonnegative and sum to one')


def price_only(providers):
    return sorted(providers, key=lambda p: (p.hourly_rate is None, float(p.hourly_rate or 0), p.provider_id))


def _distance(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None
    d_lat, d_lon = radians(float(lat2) - float(lat1)), radians(float(lon2) - float(lon1))
    a = sin(d_lat / 2) ** 2 + cos(radians(float(lat1))) * cos(radians(float(lat2))) * sin(d_lon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


class MatchingService:
    @staticmethod
    def match(db: Session, request: ServiceRequest) -> dict:
        if request.category_id is None:
            return {'requestId': request.request_id, 'weights': WEIGHTS, 'providers': []}
        query = db.query(Provider, User).join(User, User.user_id == Provider.provider_id).filter(
            Provider.approval_status == ApprovalStatus.APPROVED,
            User.account_status == "active",
        )
        if request.category_id:
            query = query.filter(Provider.service_categories.any(category_id=request.category_id))
        rows = query.all()
        price_baseline = [provider.provider_id for provider, _ in sorted(
            rows, key=lambda pair: (pair[0].hourly_rate is None, float(pair[0].hourly_rate or 0), pair[0].provider_id)
        )[:20]]
        results = []
        for provider, user in rows:
            rating, count = db.query(func.avg(Review.rating), func.count(Review.review_id)).filter(Review.reviewee_id == provider.provider_id).one()
            rating = float(rating or 0)
            completed_jobs = db.query(func.count(ServiceRequest.request_id)).filter(ServiceRequest.selected_provider_id == provider.provider_id, ServiceRequest.status == 'completed').scalar()
            quotations = db.query(Quotation).filter(Quotation.provider_id == provider.provider_id).all()
            durations = [max(0, (q.created_at - q.request.created_at).total_seconds() / 60) for q in quotations if q.created_at and q.request.created_at]
            if durations:
                provider.response_time_minutes = round(sum(durations) / len(durations))
            distance = _distance(request.latitude, request.longitude, provider.latitude, provider.longitude)
            if distance is not None and distance > float(provider.service_radius_km):
                continue
            components = {
                "rating": rating / 5,
                "proximity": 0.5 if distance is None else max(0, 1 - distance / max(float(provider.service_radius_km), 1)),
                "response": 0.5 if provider.response_time_minutes is None else max(0, min(1, 1 - provider.response_time_minutes / 240)),
                "price": 0.5 if provider.hourly_rate is None or not request.budget_max else max(0, 1 - float(provider.hourly_rate) / float(request.budget_max)),
                "experience": (min(1, (provider.experience_years or 0) / 20) + min(1, completed_jobs / 100)) / 2,
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
        return {"requestId": request.request_id, "weights": WEIGHTS, "priceOnlyProviderIds": price_baseline, "providers": response}

