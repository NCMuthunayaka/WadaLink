"""Dataset quality checks used before training."""
import csv
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "ml" / "data" / "raw" / "data_clean.csv"


def quality_report(path: Path = DATA) -> dict:
    with path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    texts = [row.get("text", "").strip().lower() for row in rows]
    return {
        "rows": len(rows),
        "duplicate_texts": len(texts) - len(set(texts)),
        "empty_texts": sum(not text for text in texts),
        "categories": dict(Counter(row.get("category", "") for row in rows)),
        "languages": dict(Counter(row.get("language", "") for row in rows)),
        "sources": dict(Counter(row.get("source", "") for row in rows)),
    }


if __name__ == "__main__":
    print(quality_report())
