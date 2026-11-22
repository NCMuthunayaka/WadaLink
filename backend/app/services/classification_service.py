from sqlalchemy.orm import Session
import re
import time

from app.ai.pipeline import ClassificationPipeline
from app.ai.groq_classifier import scrub_pii
from app.models.classification_log import ClassificationLog, ClassificationStatus
from app.models.ai_review import LabeledRequest, ReviewQueueStatus, UnmatchedRequest
from app.models.service_category import ServiceCategory
from app.models.service_request import ServiceRequest


class ClassificationService:
    pipeline = ClassificationPipeline()
    _cache: dict[str, tuple[float, dict]] = {}
    _rate: dict[int, list[float]] = {}

    @classmethod
    def classify_request(cls, db: Session, request: ServiceRequest) -> ClassificationLog:
        categories = [row.category_name for row in db.query(ServiceCategory).filter(ServiceCategory.is_active.is_(True)).all()]
        cache_key = repr((request.customer_id, tuple(sorted(categories)), cls.pipeline.model_name, cls._scrub_pii(f"{request.title} {request.description}".strip()).lower()))
        now = time.time()
        recent = [stamp for stamp in cls._rate.get(request.customer_id, []) if now - stamp < 3600]
        limited = len(recent) >= 60
        if not limited:
            recent.append(now)
        cls._rate[request.customer_id] = recent
        cached = cls._cache.get(cache_key)
        if limited:
            result = cls.pipeline.classify(None, '', categories)
        else:
            result = cached[1] if cached and now - cached[0] < 300 else cls.pipeline.classify(request.title, request.description, categories)
        cls._cache = {key: value for key, value in cls._cache.items() if now - value[0] < 300}
        if not limited:
            cls._cache[cache_key] = (now, result)
        category = db.query(ServiceCategory).filter(
            ServiceCategory.category_name.ilike(result["category"]),
            ServiceCategory.is_active.is_(True),
        ).first()
        request.category_id = category.category_id if category else request.category_id
        request.urgency = result["urgency"]
        log = ClassificationLog(
            request=request,
            category=category,
            predicted_urgency=result["urgency"],
            model_name=result["model_name"],
            model_version=result["model_name"],
            layer=result['layer'],
            confidence_score=result["confidence"],
            input_text=cls._scrub_pii(f"{request.title} {request.description}".strip()),
            output_json=result["details"],
            status=ClassificationStatus.SUCCESS if result["status"] == "success" else ClassificationStatus.FALLBACK,
        )
        db.add(log)
        if result['layer'] == 'llm':
            db.add(LabeledRequest(
                request_id=request.request_id,
                input_text=cls._scrub_pii(f"{request.title} {request.description}".strip()),
                suggested_category=result["category"],
                confidence=result["confidence"],
                status=ReviewQueueStatus.PENDING,
            ))
        if result['status'] == 'fallback':
            db.add(UnmatchedRequest(
                request_id=request.request_id,
                input_text=cls._scrub_pii(f"{request.title} {request.description}".strip()),
                reason=result["details"].get("reason", "Low confidence or similarity"),
            ))
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def _scrub_pii(text: str) -> str:
        return scrub_pii(text)

    @staticmethod
    def response(log: ClassificationLog) -> dict:
        category_name = log.category.category_name if log.category else "Uncategorized"
        return {
            "requestId": log.request_id,
            "categoryId": log.category_id,
            "categoryName": category_name,
            "predictedUrgency": log.predicted_urgency.value if log.predicted_urgency else "medium",
            "confidence": float(log.confidence_score or 0),
            "status": log.status.value,
            "modelName": log.model_name,
            "layer": log.layer or 'user',
            "details": log.output_json or {},
        }

