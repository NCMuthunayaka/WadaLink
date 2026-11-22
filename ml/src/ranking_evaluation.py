"""Evaluate independently judged CSV: request_id,provider_id,relevance,score,price,category."""
import argparse
import csv
import json
import math
from collections import defaultdict
from pathlib import Path


def metrics(rows):
    ideal = sorted(rows, key=lambda r: float(r['relevance']), reverse=True)
    def dcg(items, k):
        return sum((2 ** float(r['relevance']) - 1) / math.log2(i + 2) for i, r in enumerate(items[:k]))
    result = {f'ndcg@{k}': dcg(rows, k) / dcg(ideal, k) if dcg(ideal, k) else 0 for k in (5, 10)}
    result['mrr'] = next((1 / (i + 1) for i, r in enumerate(rows) if float(r['relevance']) > 0), 0)
    result['diversity@10'] = len({r['category'] for r in rows[:10]}) / min(10, len(rows)) if rows else 0
    return result


def evaluate(path):
    groups = defaultdict(list)
    with Path(path).open(newline='', encoding='utf-8-sig') as handle:
        for row in csv.DictReader(handle):
            groups[row['request_id']].append(row)
    if not groups:
        raise ValueError('Judged ranking dataset is empty')
    report = {}
    for name, key in [('weighted', lambda r: -float(r['score'])), ('price_only', lambda r: float(r['price']) if r['price'] else math.inf)]:
        values = [metrics(sorted(rows, key=key)) for rows in groups.values()]
        report[name] = {k: sum(v[k] for v in values) / len(values) for k in values[0]}
    report['weighted_beats_price'] = report['weighted']['ndcg@10'] > report['price_only']['ndcg@10']
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('judgements')
    parser.add_argument('--output', default='ml/reports/ranking_evaluation.json')
    args = parser.parse_args()
    result = evaluate(args.judgements)
    Path(args.output).write_text(json.dumps(result, indent=2))
