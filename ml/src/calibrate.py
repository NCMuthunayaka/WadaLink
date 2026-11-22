"""Sweep gates on a reviewed development set; never use the final human set.

Writes tables and an SVG chart. Updating runtime thresholds requires --apply.
"""
import argparse
import csv
import json
from pathlib import Path
import joblib
from sklearn.metrics.pairwise import cosine_similarity
from retrain import read_rows
from train import DATA, OUTPUT, ROOT


def calibrate(validation, output, apply=False):
    rows = read_rows(validation)
    artifact = joblib.load(OUTPUT)
    training = {r['text'].strip().casefold() for r in read_rows(DATA)}
    if any(r['text'].strip().casefold() in training for r in rows):
        raise ValueError('Validation must not overlap training')
    estimator, vectorizer = artifact['model'], artifact['vectorizer']
    probabilities = estimator.predict_proba([r['text'] for r in rows])
    similarities = cosine_similarity(vectorizer.transform([r['text'] for r in rows]), vectorizer.transform(artifact['examples'])).max(axis=1)
    candidates = []
    for confidence in (.4, .5, .6, .7, .8, .9):
        for margin in (.1, .15, .2):
            for similarity in (.1, .2, .3, .4):
                accepted = correct = 0
                for row, probs, sim in zip(rows, probabilities, similarities):
                    ordered = sorted(probs, reverse=True)
                    prediction = str(estimator.classes_[probs.argmax()])
                    gate = ordered[0] >= confidence and ordered[0]-ordered[1] >= margin and sim >= similarity and prediction != 'other'
                    accepted += int(gate)
                    correct += int(gate and prediction == row['category'])
                candidates.append({'confidence': confidence, 'margin': margin, 'similarity': similarity, 'accepted_accuracy': correct/accepted if accepted else 0, 'coverage': accepted/len(rows), 'llm_route_percent': 100*(1-accepted/len(rows))})
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    with (output/'threshold_sweep.csv').open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(candidates[0]))
        writer.writeheader()
        writer.writerows(candidates)
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig, axis = plt.subplots()
    axis.scatter([r['llm_route_percent'] for r in candidates], [r['accepted_accuracy'] for r in candidates])
    axis.set(xlabel='Requests routed to LLM (%)', ylabel='Accepted model accuracy', ylim=(0, 1))
    fig.savefig(output/'threshold_sweep.svg', bbox_inches='tight')
    plt.close(fig)
    eligible = [r for r in candidates if r['accepted_accuracy'] >= .9 and r['coverage'] > 0]
    if not eligible:
        raise ValueError('No gate achieved 90% accepted accuracy; inspect the saved sweep')
    selected = max(eligible, key=lambda r: r['coverage'])
    thresholds = {k: selected[k] for k in ('confidence', 'margin', 'similarity')}
    (output/'threshold.json').write_text(json.dumps(thresholds))
    if apply:
        (ROOT/'backend/app/ai/threshold.json').write_text(json.dumps(thresholds))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('validation', type=Path)
    parser.add_argument('--output', default='ml/reports/calibration')
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    calibrate(args.validation, args.output, args.apply)
