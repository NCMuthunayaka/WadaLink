"""Compare word/character TF-IDF with Logistic Regression and Linear SVM."""
import csv
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "ml" / "data" / "raw" / "data_clean.csv"


def load():
    with DATA.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    return [r["text"] for r in rows], [r["category"] for r in rows]


if __name__ == "__main__":
    texts, labels = load()
    x_train, x_test, y_train, y_test = train_test_split(texts, labels, test_size=.15, random_state=42, stratify=labels)
    for analyzer in ("word", "char"):
        for estimator in (LogisticRegression(max_iter=1000), LinearSVC()):
            model = Pipeline([("tfidf", TfidfVectorizer(analyzer=analyzer, ngram_range=(1, 2) if analyzer == "word" else (3, 5))), ("model", estimator)])
            model.fit(x_train, y_train)
            print(analyzer, estimator.__class__.__name__, round(accuracy_score(y_test, model.predict(x_test)), 4))
