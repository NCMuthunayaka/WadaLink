from pathlib import Path
import re
import json
from app.ai.groq_classifier import classify as groq_classify

from app.ai.keyword_fallback import classify_text

try:
    import joblib
except ImportError:  # pragma: no cover
    joblib = None


class ClassificationPipeline:
    model_path = Path(__file__).resolve().parents[4] / "ml" / "models" / "service-category.joblib"

    def __init__(self):
        self.thresholds = json.loads(Path(__file__).with_name("threshold.json").read_text())
        self.model = None
        self.examples = []
        self.vectorizer = None
        if joblib and self.model_path.exists():
            try:
                loaded = joblib.load(self.model_path)
            except Exception:
                loaded = {}
            if isinstance(loaded, dict):
                self.model = loaded.get("model")
                self.examples = loaded.get("examples", [])
                self.vectorizer = loaded.get("vectorizer")
            else:
                self.model = loaded
        self.model_name = "tfidf-logistic-v1" if self.model else "keyword-fallback-v1"

    def classify(self, title: str | None, description: str, categories=None) -> dict:
        try:
            return self._classify(title, description, categories)
        except Exception:
            return {'category': 'User Picks', 'confidence': 0.0, 'urgency': classify_text(description)['urgency'], 'status': 'fallback', 'layer': 'user', 'model_name': self.model_name, 'details': {'safetyTips': [], 'categories': categories or [], 'reason': 'Automatic classification is unavailable'}}

    def _classify(self, title, description, categories):
        suggestions = list(categories or [])
        text = f"{title or ''} {description}".strip()
        if len(re.sub(r"\W", "", text)) < 8:
            return {
                "category": "User Picks",
                "confidence": 0.0,
                "urgency": classify_text(text or "repair")["urgency"],
                "details": {"safetyTips": [], "categories": categories or [], "reason": "Description is too short to classify reliably."},
                "status": "fallback",
                "model_name": self.model_name,
                "layer": "user",
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
                from sklearn.metrics.pairwise import cosine_similarity
                similarity = float(cosine_similarity(query_vector, example_vectors).max())
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
            result["status"] = "success" if result["confidence"] >= self.thresholds['confidence'] and margin >= self.thresholds['margin'] and similarity >= self.thresholds['similarity'] and result["category"] != "Other" else "fallback"
            result['layer'] = 'model'
            if categories:
                probabilities_by_name = {str(name).replace('_', ' ').casefold(): float(prob) for name, prob in zip(self.model.classes_, probabilities)}
                suggestions.sort(key=lambda name: probabilities_by_name.get(name.casefold(), 0), reverse=True)
            if categories is not None and result['category'] not in categories:
                result['status'] = 'fallback'
            if result["status"] == "fallback":
                result["category"] = "User Picks"
        else:
            result = classify_text(text)
            result['status'] = 'fallback'
        if result['status'] != 'success':
            llm = groq_classify(text, categories or [])
            if llm and llm['category'] not in {'new_service', 'unclear'}:
                result.update(llm, layer='llm', status='success')
            elif llm and llm['category'] == 'new_service':
                result.update(category='User Picks', layer='user', status='fallback', confidence=0.0)
                result['details']['reason'] = 'Service not available yet'
            else:
                keyword = classify_text(text)
                accepted = keyword['confidence'] >= 0.6 and keyword['category'] != 'General Maintenance'
                accepted = accepted and (not categories or keyword['category'] in categories)
                result.update(keyword)
                result.update(layer='keyword' if accepted else 'user', status='success' if accepted else 'fallback')
                if not accepted:
                    result.update(category='User Picks', confidence=0.0)
        result['details']['categories'] = suggestions
        result["model_name"] = self.model_name
        return result

