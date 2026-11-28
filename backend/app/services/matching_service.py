from math import asin, cos, radians, sin, sqrt
import json
from pathlib import Path
from sqlalchemy import case, extract, func
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
            return {
                "requestId": request.request_id,
                "weights": WEIGHTS,
                "priceOnlyProviderIds": [],
                "providers": [],
            }
        query = db.query(Provider, User).join(User, User.user_id == Provider.provider_id).filter(
            Provider.approval_status == ApprovalStatus.APPROVED,
            User.account_status == "active",
        )
        if request.category_id:
            query = query.filter(Provider.service_categories.any(category_id=request.category_id))
        rows = query.all()
        provider_ids = [provider.provider_id for provider, _ in rows]
        if not provider_ids:
            return {"requestId": request.request_id, "weights": WEIGHTS, "priceOnlyProviderIds": [], "providers": []}

        review_stats = {
            provider_id: (float(rating or 0), int(count))
            for provider_id, rating, count in db.query(
                Review.reviewee_id, func.avg(Review.rating), func.count(Review.review_id)
            ).filter(Review.reviewee_id.in_(provider_ids)).group_by(Review.reviewee_id).all()
        }
        completed_jobs = {
            provider_id: int(count)
            for provider_id, count in db.query(
                ServiceRequest.selected_provider_id, func.count(ServiceRequest.request_id)
            ).filter(
                ServiceRequest.selected_provider_id.in_(provider_ids),
                ServiceRequest.status == "completed",
            ).group_by(ServiceRequest.selected_provider_id).all()
        }
        if db.get_bind().dialect.name == "sqlite":
            response_minutes = (
                func.julianday(Quotation.created_at)
                - func.julianday(ServiceRequest.created_at)
            ) * 1440
        else:
            response_minutes = extract(
                "epoch", Quotation.created_at - ServiceRequest.created_at
            ) / 60
        response_stats = {
            provider_id: round(float(minutes))
            for provider_id, minutes in db.query(
                Quotation.provider_id,
                func.avg(case((response_minutes < 0, 0), else_=response_minutes)),
            ).join(
                ServiceRequest, ServiceRequest.request_id == Quotation.request_id
            ).filter(
                Quotation.provider_id.in_(provider_ids),
                Quotation.created_at.isnot(None),
                ServiceRequest.created_at.isnot(None),
            ).group_by(Quotation.provider_id).all()
            if minutes is not None
        }
        existing_scores = {
            score.provider_id: score
            for score in db.query(ProviderScore).filter(
                ProviderScore.request_id == request.request_id,
                ProviderScore.provider_id.in_(provider_ids),
            ).all()
        }
        results = []
        for provider, user in rows:
            rating, count = review_stats.get(provider.provider_id, (0.0, 0))
            completed_count = completed_jobs.get(provider.provider_id, 0)
            if provider.provider_id in response_stats:
                provider.response_time_minutes = response_stats[provider.provider_id]
            distance = _distance(request.latitude, request.longitude, provider.latitude, provider.longitude)
            if distance is not None and distance > float(provider.service_radius_km):
                continue
            components = {
                "rating": rating / 5 if count else 0.5,
                "proximity": 0.5 if distance is None else max(0, 1 - distance / max(float(provider.service_radius_km), 1)),
                "response": 0.5 if provider.response_time_minutes is None else max(0, min(1, 1 - provider.response_time_minutes / 240)),
                "price": 0.5 if provider.hourly_rate is None or not request.budget_max else max(0, 1 - float(provider.hourly_rate) / float(request.budget_max)),
                "experience": (min(1, (provider.experience_years or 0) / 20) + min(1, completed_count / 100)) / 2,
            }
            total = sum(components[k] * WEIGHTS[k] for k in WEIGHTS)
            results.append((total, provider, user, rating, count, distance, components))
        results.sort(key=lambda row: row[0], reverse=True)
        price_baseline = [provider.provider_id for provider in price_only([row[1] for row in results])[:20]]
        response = []
        for rank, (total, provider, user, rating, count, distance, components) in enumerate(results[:20], 1):
            existing = existing_scores.get(provider.provider_id)
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

