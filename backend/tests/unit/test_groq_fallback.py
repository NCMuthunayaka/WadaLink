from app.ai.groq_classifier import scrub_pii, classify
from app.ai.pipeline import ClassificationPipeline


def test_missing_key(monkeypatch):
    monkeypatch.delenv('GROQ_API_KEY', raising=False)
    assert classify('leaking pipe', ['Plumbing']) is None


def test_redaction():
    result = scrub_pii('Call +94771234567 at 123 Main Street')
    assert '94771234567' not in result
    assert '123 Main Street' not in result


def test_manual_fallback(monkeypatch):
    monkeypatch.delenv('GROQ_API_KEY', raising=False)
    pipeline = ClassificationPipeline()
    pipeline.model = None
    for text in ['', 'hi', 'fix my car', 'zxqv jklp']:
        result = pipeline.classify(None, text, ['Plumbing'])
        assert result['layer'] == 'user'
        assert result['status'] == 'fallback'
