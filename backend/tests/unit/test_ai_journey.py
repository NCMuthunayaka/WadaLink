"""Offline API journeys using real classification, SQLite, and authenticated users."""
from app.models.provider import Provider, ApprovalStatus
from app.models.service_category import ServiceCategory
from app.services.classification_service import ClassificationService
from tests.m1.helpers import register, bearer


def test_request_classification_manual_correction_and_matching(client, session_factory, monkeypatch):
    monkeypatch.setattr('app.ai.pipeline.groq_classify', lambda *_: None)
    ClassificationService._cache.clear()
    ClassificationService._rate.clear()
    customer = register(client).json()
    provider = register(client, 'provider@example.com', 'provider').json()
    with session_factory() as db:
        plumbing = ServiceCategory(category_name='Plumbing', is_active=True)
        electrical = ServiceCategory(category_name='Electrical', is_active=True)
        db.add_all([plumbing, electrical])
        db.flush()
        category_id = electrical.category_id
        row = db.get(Provider, provider['user']['user_id'])
        row.approval_status = ApprovalStatus.APPROVED
        row.service_categories = [electrical]
        db.commit()
    headers = bearer(customer['access_token'])
    response = client.post('/api/v1/requests', headers=headers, json={
        'title': 'Leaking pipe', 'description': 'The kitchen water pipe is leaking and needs plumbing repair.', 'address': 'Test address'})
    assert response.status_code == 200
    request_id = response.json()['id']
    classification = client.get(f'/api/v1/requests/{request_id}/classification', headers=headers)
    assert classification.status_code == 200
    assert classification.json()['categoryName'] == 'Plumbing'
    correction = client.patch(f'/api/v1/requests/{request_id}', headers=headers, json={'categoryId': category_id})
    assert correction.status_code == 200
    result = client.get(f'/api/v1/requests/{request_id}/matches', headers=headers)
    assert result.status_code == 200
    matches = result.json()['providers']
    assert len(matches) == 1
    assert str(matches[0]['providerId']) == str(provider['user']['user_id'])
    assert matches[0]['score']['rating'] == .5


def test_request_and_manual_correction_survive_ai_outage(client, session_factory, monkeypatch):
    def unavailable(*args):
        raise RuntimeError('Simulated AI outage')
    monkeypatch.setattr(ClassificationService, 'classify_request', unavailable)
    customer = register(client).json()
    headers = bearer(customer['access_token'])
    with session_factory() as db:
        category = ServiceCategory(category_name='Plumbing', is_active=True)
        db.add(category)
        db.commit()
        category_id = category.category_id
    created = client.post('/api/v1/requests', headers=headers, json={'title': 'Help needed', 'description': 'Water coming from beneath the sink', 'address': 'Test address'})
    assert created.status_code == 200
    request_id = created.json()['id']
    corrected = client.patch(f'/api/v1/requests/{request_id}', headers=headers, json={'categoryId': category_id})
    assert corrected.status_code == 200
    assert str(corrected.json()['categoryId']) == str(category_id)
    assert client.get(f'/api/v1/requests/{request_id}/matches', headers=headers).status_code == 200
