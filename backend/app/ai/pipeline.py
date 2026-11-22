from pathlib import Path
import re

from app.ai.keyword_fallback import classify_text

try:
    import joblib
except ImportError:  # pragma: no cover
    joblib = None


class ClassificationPipeline:
    model_path = Path(__file__).resolve().parents[3] / "ml" / "models" / "service-category.joblib"

    def __init__(self):
        self.model = None
        self.examples = []
        self.vectorizer = None
        if joblib and self.model_path.exists():
            loaded = joblib.load(self.model_path)
            if isinstance(loaded, dict):
                self.model = loaded.get("model")
                self.examples = loaded.get("examples", [])
                self.vectorizer = loaded.get("vectorizer")
            else:
                self.model = loaded
        self.model_name = "tfidf-logistic-v1" if self.model else "keyword-fallback-v1"

    def classify(self, title: str | None, description: str) -> dict:
        text = f"{title or ''} {description}".strip()
        if len(re.sub(r"\W", "", text)) < 8:
            return {
                "category": "User Picks",
                "confidence": 0.0,
                "urgency": classify_text(text or "repair")["urgency"],
                "details": {"safetyTips": [], "reason": "Description is too short to classify reliably."},
                "status": "fallback",
                "model_name": self.model_name,
            }
        if self.model:
            probabilities = self.model.predict_proba([text])[0]
            index = probabilities.argmax()
            sorted_probabilities = sorted(probabilities, reverse=True)
            margin = float(sorted_probabilities[0] - sorted_probabilities[1]) if len(sorted_probabilities) > 1 else 1.0
            similarity = 0.0
            if self.vectorizer is not None and self.examples:
                query_vector = self.vectorizer.transform([text])
                example_vectors = self.vectorizer.transform(self.examples)
                similarity = float((example_vectors @ query_vector.T).max())
            result = classify_text(text)
            category_name = str(self.model.classes_[index]).replace("_", " ").title()
            result["category"] = {
                "Hvac": "HVAC",
                "Ac Refrigeration": "HVAC",
                "Electrical": "Electrical",
                "Plumbing": "Plumbing",
            }.get(category_name, category_name)
            result["confidence"] = round(float(probabilities[index]), 4)
            result["details"]["margin"] = round(margin, 4)
            result["details"]["similarity"] = round(similarity, 4)
            result["status"] = "success" if result["confidence"] >= 0.60 and margin >= 0.15 and similarity >= 0.20 and result["category"] != "Other" else "fallback"
            if result["status"] == "fallback":
                result["category"] = "User Picks"
        else:
            result = classify_text(text)
        result["model_name"] = self.model_name
        return result

