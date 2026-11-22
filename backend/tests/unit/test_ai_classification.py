from app.ai.keyword_fallback import classify_text
from app.ai.pipeline import ClassificationPipeline
from app.models.service_request import UrgencyLevel
from app.services.matching_service import WEIGHTS, _distance


def test_keyword_classifier_detects_plumbing_and_hazard():
    result = classify_text("There is a gas leak under the kitchen sink")

    assert result["category"] == "Plumbing"
    assert result["urgency"] == UrgencyLevel.EMERGENCY
    assert result["details"]["safetyTips"]
    assert result["confidence"] <= 1


def test_pipeline_uses_trained_model_when_available():
    pipeline = ClassificationPipeline()
    result = pipeline.classify("Cooling problem", "The air conditioner is not cooling")

    assert result["category"] in {"HVAC", "General Maintenance"}
    assert 0 <= result["confidence"] <= 1
    assert result["model_name"] in {"tfidf-logistic-v1", "keyword-fallback-v1"}
    assert result["status"] in {"success", "fallback"}


def test_matching_weights_and_distance_are_deterministic():
    assert sum(WEIGHTS.values()) == 1
    assert _distance(0, 0, 0, 0) == 0
    assert 110 < _distance(0, 0, 1, 0) < 112
