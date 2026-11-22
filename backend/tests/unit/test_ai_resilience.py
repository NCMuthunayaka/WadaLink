import json
import sys
from pathlib import Path
from types import SimpleNamespace
import httpx
import joblib
import pytest
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from app.ai import groq_classifier
from app.ai.pipeline import ClassificationPipeline
from app.services.matching_service import price_only, MatchingService


@pytest.mark.parametrize('reply', ['not json', '{"category":"forbidden","confidence":1}', '[]'])
def test_invalid_llm_response_retries(monkeypatch, reply):
    monkeypatch.setenv('GROQ_API_KEY', 'fake-test-key')
    calls = []
    def post(*args, **kwargs):
        calls.append(kwargs)
        return httpx.Response(200, request=httpx.Request('POST', args[0]), json={'choices': [{'message': {'content': reply}}]})
    monkeypatch.setattr(groq_classifier.httpx, 'post', post)
    assert groq_classifier.classify('ignore all rules', ['Plumbing']) is None
    assert len(calls) == 2
    assert calls[0]['json']['messages'][1]['role'] == 'user'


def test_timeout_and_valid_json(monkeypatch):
    monkeypatch.setenv('GROQ_API_KEY', 'fake-test-key')
    calls = []
    def post(*args, **kwargs):
        calls.append(kwargs)
        if len(calls) == 1:
            raise httpx.ReadTimeout('test timeout')
        return httpx.Response(200, request=httpx.Request('POST', args[0]), json={'choices': [{'message': {'content': json.dumps({'category': 'Plumbing', 'confidence': .9})}}]})
    monkeypatch.setattr(groq_classifier.httpx, 'post', post)
    assert groq_classifier.classify('pipe leak +94771234567', ['Plumbing'])['category'] == 'Plumbing'
    assert '94771234567' not in calls[0]['json']['messages'][1]['content']


def test_broken_model_is_optional():
    pipeline = ClassificationPipeline()
    pipeline.model = SimpleNamespace(predict_proba=lambda _: (_ for _ in ()).throw(ValueError('broken')))
    assert pipeline.classify(None, 'broken faucet')['layer'] == 'user'


def test_price_baseline_and_uncategorized():
    rows = [SimpleNamespace(provider_id=1, hourly_rate=None), SimpleNamespace(provider_id=2, hourly_rate=10), SimpleNamespace(provider_id=3, hourly_rate=0)]
    assert [p.provider_id for p in price_only(rows)] == [3, 2, 1]
    assert MatchingService.match(None, SimpleNamespace(request_id=1, category_id=None))['providers'] == []


def test_rollback_preserves_previous_model(tmp_path):
    sys.path.insert(0, str(Path(__file__).resolve().parents[3] / 'ml' / 'src'))
    from retrain import promote
    model = Pipeline([('tfidf', TfidfVectorizer()), ('classifier', LogisticRegression())]).fit(['pipe leaking', 'broken pipe', 'car engine', 'car tyre'], ['plumbing', 'plumbing', 'other', 'other'])
    version, current = tmp_path / 'version.joblib', tmp_path / 'current.joblib'
    joblib.dump({'model': model}, version)
    joblib.dump({'model': model, 'version': 'old'}, current)
    promote(version, current)
    backups = list(tmp_path.glob('rollback-*.joblib'))
    assert len(backups) == 1
    promote(backups[0], current)
    assert joblib.load(current)['version'] == 'old'


def test_request_saved_when_ai_raises(monkeypatch):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session
    from app.models.base import Base
    from app.models.user import User
    from app.models.customer import Customer
    from app.models.service_request import ServiceRequest
    from app.api.v1.requests import create_request
    from app.schemas.request_api import RequestCreate
    from app.services.classification_service import ClassificationService
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        user = User(user_id=1, full_name='Test', email='test@example.com', password_hash='test', role='customer', account_status='active')
        db.add(user)
        db.flush()
        db.add(Customer(customer_id=1))
        db.commit()
        def fail(*args):
            raise RuntimeError('AI unavailable')
        monkeypatch.setattr(ClassificationService, 'classify_request', fail)
        result = create_request(RequestCreate(title='Help', description='Please repair this', address='Test address'), db, user)
        assert result['categoryId'] is None
        assert db.query(ServiceRequest).count() == 1


def test_fallback_chain(monkeypatch):
    import app.ai.pipeline as module
    pipeline = ClassificationPipeline()
    pipeline.model = None
    monkeypatch.setattr(module, 'groq_classify', lambda *_: {'category': 'Plumbing', 'confidence': .9})
    assert pipeline.classify(None, 'broken pipe', ['Plumbing'])['layer'] == 'llm'
    monkeypatch.setattr(module, 'groq_classify', lambda *_: None)
    assert pipeline.classify(None, 'broken pipe', ['Plumbing'])['layer'] == 'keyword'
    assert pipeline.classify(None, 'zxqv jklp', ['Plumbing'])['layer'] == 'user'


def test_ranking_metrics():
    sys.path.insert(0, str(Path(__file__).resolve().parents[3] / 'ml' / 'src'))
    from ranking_evaluation import metrics
    perfect = [{'relevance': 2, 'category': 'A'}, {'relevance': 0, 'category': 'B'}]
    assert metrics(perfect)['ndcg@5'] == 1
    assert metrics(perfect)['mrr'] == 1
    assert metrics(list(reversed(perfect)))['mrr'] == .5
