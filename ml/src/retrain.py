"""Candidate training and guarded promotion; validation must be an independent development set."""
from pathlib import Path
from datetime import datetime
import shutil
import argparse
import csv
import json
import os
import joblib
from sklearn.metrics import f1_score
from evaluate import model
from train import DATA, OUTPUT


def promote(source, destination=OUTPUT):
    source, destination = Path(source), Path(destination)
    artifact = joblib.load(source)
    artifact['model'].predict(['probe'])
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        shutil.copy2(destination, destination.with_name(f'rollback-{datetime.now():%Y%m%d%H%M%S%f}.joblib'))
    temporary = destination.with_suffix('.pending')
    shutil.copy2(source, temporary)
    os.replace(temporary, destination)


def read_rows(path):
    with Path(path).open(encoding='utf-8-sig', newline='') as handle:
        rows = list(csv.DictReader(handle))
    if not rows or any(not r.get('text') or not r.get('category') for r in rows):
        raise ValueError('Nonempty text/category CSV required')
    return rows


def retrain(validation, approved=None):
    rows = read_rows(DATA)
    if approved:
        extra = read_rows(approved)
        if any(r.get('status') != 'approved' for r in extra):
            raise ValueError('Only approved labels may be used')
        rows += extra
    labels = {}
    for row in rows:
        key = row['text'].strip().casefold()
        if key in labels and labels[key]['category'] != row['category']:
            raise ValueError('Conflicting duplicate labels require review')
        labels[key] = row
    rows = list(labels.values())
    valid = read_rows(validation)
    if any(r['text'].strip().casefold() in labels for r in valid):
        raise ValueError('Validation overlaps training data')
    if 'other' not in {r['category'] for r in rows}:
        raise ValueError('Reviewed other training examples are required')
    texts = [r['text'] for r in rows]
    candidate = model().fit(texts, [r['category'] for r in rows])
    def score(estimator):
        return f1_score([r['category'] for r in valid], estimator.predict([r['text'] for r in valid]), average='macro', zero_division=0)
    previous = joblib.load(OUTPUT)['model'] if OUTPUT.exists() else None
    new_score, old_score = score(candidate), score(previous) if previous else 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    version = OUTPUT.with_name(f'candidate-{datetime.now():%Y%m%d%H%M%S%f}.joblib')
    joblib.dump({'model': candidate, 'vectorizer': candidate.named_steps['tfidf'], 'examples': texts}, version)
    accepted = new_score >= old_score
    version.with_suffix('.json').write_text(json.dumps({'macro_f1': new_score, 'previous_macro_f1': old_score, 'promoted': accepted}))
    if accepted:
        promote(version)
    return accepted


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--validation', type=Path)
    parser.add_argument('--approved', type=Path)
    parser.add_argument('--rollback', type=Path)
    args = parser.parse_args()
    if args.rollback:
        promote(args.rollback)
    elif args.validation:
        print({'promoted': retrain(args.validation, args.approved)})
    else:
        parser.error('--validation or --rollback is required')
