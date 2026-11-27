"""One-command offline regression evaluation; never trains or promotes a model."""
from datetime import datetime, timezone
from pathlib import Path
from benchmark_data import build
from evaluate_system import evaluate
from ranking_smoke import run

ROOT = Path(__file__).resolve().parents[2]

if __name__ == '__main__':
    data = build(ROOT / 'ml/data/evaluation/synthetic')
    output = ROOT / 'ml/reports' / ('regression-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'))
    report = evaluate(data / 'test.csv', data / 'out_of_scope.csv', output)
    run()
    print(f'Synthetic-only report: {output}')
    print(f'Combined in-scope accuracy: {report["combined"]["in_scope"]["accuracy"]:.3f}')
    print(f'Combined out-of-scope false acceptance: {report["combined"]["oos_false_acceptance"]:.3f}')
    print('Not independent accuracy evidence. No model was trained or promoted.')
