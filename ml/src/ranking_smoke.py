"""Actual ranking on SQLite fixtures; policy labels are synthetic, not user judgements."""
import json
import os
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))
os.environ.setdefault('DATABASE_URL', 'sqlite://')
os.environ.setdefault('JWT_SECRET_KEY', 'offline-ranking-fixture-only-secret')
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import app.models
from app.models.base import Base
from app.models.user import User
from app.models.customer import Customer
from app.models.provider import Provider
from app.models.service_request import ServiceRequest
from app.models.service_category import ServiceCategory
from app.services.matching_service import MatchingService
from ranking_evaluation import metrics


def run():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    scenarios = []
    with Session(engine) as db:
        category = ServiceCategory(category_name='Plumbing', is_active=True)
        customer = User(user_id=1, full_name='Fixture customer', email='fixture@example.test', password_hash='unused', role='customer', account_status='active')
        db.add_all([category, customer]); db.flush()
        db.add(Customer(customer_id=1))
        for identifier, price, experience in [(2, 10, 1), (3, 40, 10), (4, 90, 20)]:
            db.add(User(user_id=identifier, full_name=f'Fixture {identifier}', email=f'{identifier}@example.test', password_hash='unused', role='provider', account_status='active'))
            db.flush()
            db.add(Provider(provider_id=identifier, approval_status='approved', hourly_rate=price, experience_years=experience, service_categories=[category]))
        db.commit()
        for number, (name, relevance) in enumerate([
            ('budget_priority', {2: 3, 3: 1, 4: 0}),
            ('experience_priority', {2: 0, 3: 1, 4: 3}),
        ], 1):
            request = ServiceRequest(customer_id=1, category_id=category.category_id, title=name, description='Fixture plumbing repair', address='Fixture', urgency='medium', status='open', budget_max=100)
            db.add(request); db.commit(); db.refresh(request)
            result = MatchingService.match(db, request)
            ranked = [{'provider_id': p['providerId'], 'relevance': relevance[int(p['providerId'])], 'score': p['score']['total'], 'price': p['hourlyRate'], 'category': 'Plumbing'} for p in result['providers']]
            scenarios.append({'scenario': name, 'weighted': metrics(ranked), 'price_only': metrics(sorted(ranked, key=lambda p: p['price'])), 'providers': ranked})
    report = {'evidence_type': 'synthetic_policy_scenarios', 'limitations': 'Preference labels are authored, not observed customer choices. These scenarios do not establish weighted-ranking superiority.', 'scenarios': scenarios}
    path = ROOT / 'ml/reports/ranking_smoke.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2))
    return report


if __name__ == '__main__':
    print(json.dumps(run(), indent=2))
