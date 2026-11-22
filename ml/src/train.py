"""Train and export the service-category classifier used by the backend.

Run from the repository root with: python ml/src/train.py
"""
from pathlib import Path
import csv

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "ml" / "data" / "raw" / "data_clean.csv"
OUTPUT = ROOT / "ml" / "models" / "service-category.joblib"


def train() -> Path:
    texts = []
    categories = []
    with DATA.open("r", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            text = (row.get("text") or "").strip()
            category = (row.get("category") or "").strip()
            if text and category:
                texts.append(text)
                categories.append(category)
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(lowercase=True, analyzer="char", ngram_range=(3, 5), min_df=1)),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ])
    train_texts, validation_texts, train_categories, validation_categories = train_test_split(
        texts, categories, test_size=0.15, random_state=42, stratify=categories
    )
    pipeline.fit(train_texts, train_categories)
    predictions = pipeline.predict(validation_texts)
    print(f"validation_accuracy={accuracy_score(validation_categories, predictions):.4f}")
    print(classification_report(validation_categories, predictions, zero_division=0))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": pipeline, "vectorizer": pipeline.named_steps["tfidf"], "examples": train_texts}, OUTPUT)
    return OUTPUT


if __name__ == "__main__":
    print(f"exported {train()}")
