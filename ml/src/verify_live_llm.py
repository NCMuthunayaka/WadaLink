"""Single synthetic live probe; no customer data and no secret values in output."""
import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))
load_dotenv(ROOT / 'backend/.env')
from app.ai.groq_classifier import classify


def verify():
    enabled = bool(os.getenv('GROQ_API_KEY')) and os.getenv('LLM_PROVIDER', 'groq') == 'groq'
    report = {'configured': enabled, 'status': 'not_configured', 'input_provenance': 'synthetic_smoke_probe'}
    if enabled:
        start = time.perf_counter()
        result = classify('Water leaks from the pipe under the kitchen sink. I need it repaired.', ['Plumbing', 'Electrical', 'HVAC'])
        report.update(status='passed' if result and result['category'] == 'Plumbing' and result['confidence'] >= .65 else 'failed', seconds=time.perf_counter()-start, result=result)
    destination = ROOT / 'ml/reports/live_llm_smoke.json'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, indent=2))
    print(json.dumps(report))
    return report


if __name__ == '__main__':
    verify()
