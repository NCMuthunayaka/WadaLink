"""Evaluation utilities for source holdout and worst-prediction review."""
import csv
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "ml" / "data" / "raw" / "data_clean.csv"
REPORT = ROOT / "ml" / "reports"


def rows():
    with DATA.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def model():
    return Pipeline([("tfidf", TfidfVectorizer(analyzer="char", ngram_range=(3, 5))), ("classifier", LogisticRegression(max_iter=1000))])


def leave_one_source_out(data):
    results = []
    for source in sorted({row["source"] for row in data}):
        train = [row for row in data if row["source"] != source]
        test = [row for row in data if row["source"] == source]
        candidate = model().fit([r["text"] for r in train], [r["category"] for r in train])
        results.append({"source": source, "accuracy": accuracy_score([r["category"] for r in test], candidate.predict([r["text"] for r in test]))})
    return results


def worst_predictions(data):
    candidate = model().fit([r["text"] for r in data], [r["category"] for r in data])
    probabilities = candidate.predict_proba([r["text"] for r in data])
    rows_out = []
    for row, prediction, probability in zip(data, candidate.predict([r["text"] for r in data]), probabilities):
        rows_out.append({"text": row["text"], "actual": row["category"], "predicted": prediction, "confidence": max(probability)})
    return sorted(rows_out, key=lambda item: item["confidence"])[:30]


if __name__ == "__main__":
    REPORT.mkdir(exist_ok=True)
    data = rows()
    (REPORT / "leave_one_source_out.csv").write_text("source,accuracy\n" + "\n".join(f"{r['source']},{r['accuracy']:.4f}" for r in leave_one_source_out(data)), encoding="utf-8")
    with (REPORT / "worst_predictions.csv").open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "actual", "predicted", "confidence"]); writer.writeheader(); writer.writerows(worst_predictions(data))
