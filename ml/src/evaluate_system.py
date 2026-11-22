"""Explicit held-out evaluation. Never trains on evaluation inputs.

python ml/src/evaluate_system.py --human human.csv --out-of-scope oos.csv
Both CSVs require text,category; unknown examples use category other.
Use --with-llm only when a Groq key and remote-data permission are available.
"""
import argparse
import csv
import hashlib
import json
import sys
import time
from collections import Counter
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))
from app.ai.pipeline import ClassificationPipeline
from app.ai.keyword_fallback import classify_text
from app.ai.groq_classifier import classify as llm
from retrain import read_rows


def label(value):
    return value.strip().casefold().replace(' ', '_') if value not in {'User Picks', 'new_service', 'unclear'} else 'other'


def evaluate(human, out_of_scope, output, with_llm=False):
    human_rows, oos_rows = read_rows(human), read_rows(out_of_scope)
    rows = human_rows + oos_rows
    training = read_rows(ROOT / 'ml/data/raw/data_clean.csv')
    training_text = {r['text'].strip().casefold() for r in training}
    if any(r['text'].strip().casefold() in training_text for r in rows):
        raise ValueError('Held-out data overlaps training data')
    pipeline = ClassificationPipeline()
    if pipeline.model is None:
        raise ValueError('Model artifact is unavailable')
    categories = [str(c).replace('_', ' ').title() for c in pipeline.model.classes_ if c != 'other']
    if not with_llm:
        import app.ai.pipeline as module
        module.groq_classify = lambda *_: None
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    records = []
    for row in rows:
        for mode in ['model', 'keyword', 'combined'] + (['llm'] if with_llm else []):
            start = time.perf_counter()
            if mode == 'model':
                result = {'category': str(pipeline.model.predict([row['text']])[0]), 'layer': 'model'}
            elif mode == 'keyword':
                result = classify_text(row['text'])
                if result['confidence'] < .6 or result['category'] == 'General Maintenance':
                    result['category'] = 'User Picks'
            elif mode == 'llm':
                result = llm(row['text'], categories) or {'category': 'User Picks'}
            else:
                result = pipeline.classify(None, row['text'], categories)
            records.append({'mode': mode, 'actual': label(row['category']), 'predicted': label(result['category']), 'layer': result.get('layer', mode), 'seconds': time.perf_counter() - start})
    report = {'input_sha256': {str(p): hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in (human, out_of_scope)}, 'llm_enabled': with_llm}
    for mode in sorted({r['mode'] for r in records}):
        values = [r for r in records if r['mode'] == mode]
        known = values[:len(human_rows)]
        expected, predicted = [r['actual'] for r in known], [r['predicted'] for r in known]
        labels = sorted(set(expected + predicted))
        report[mode] = {'human': classification_report(expected, predicted, zero_division=0, output_dict=True), 'labels': labels, 'confusion_matrix': confusion_matrix(expected, predicted, labels=labels).tolist(), 'oos_false_acceptance': sum(r['predicted'] != 'other' for r in values[len(human_rows):]) / len(oos_rows), 'mean_seconds': sum(r['seconds'] for r in values) / len(values), 'layer_percentages': {k: 100*v/len(values) for k,v in Counter(r['layer'] for r in values).items()}}
    (output / 'metrics.json').write_text(json.dumps(report, indent=2))
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    for mode in sorted({r['mode'] for r in records}):
        fig, axis = plt.subplots(figsize=(10, 8))
        axis.imshow(report[mode]['confusion_matrix'])
        axis.set(title=f'{mode}: human test confusion matrix', xlabel='Predicted', ylabel='Actual')
        axis.set_xticks(range(len(report[mode]['labels'])), report[mode]['labels'], rotation=90)
        axis.set_yticks(range(len(report[mode]['labels'])), report[mode]['labels'])
        fig.savefig(output / f'{mode}_confusion.png', bbox_inches='tight')
        plt.close(fig)
    with (output / 'predictions.csv').open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(records[0]))
        writer.writeheader()
        writer.writerows(records)
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--human', required=True, type=Path)
    parser.add_argument('--out-of-scope', required=True, type=Path)
    parser.add_argument('--output', default='ml/reports/heldout')
    parser.add_argument('--with-llm', action='store_true')
    args = parser.parse_args()
    evaluate(args.human, args.out_of_scope, args.output, args.with_llm)
