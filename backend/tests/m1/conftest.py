import pytest

from app.models.service_category import ServiceCategory


@pytest.fixture(autouse=True)
def no_ai(monkeypatch):
    """Keep tests offline: skip the AI classification step."""
    monkeypatch.setattr(
        "app.api.v1.requests.ClassificationService.classify_request",
        lambda db, request, **kwargs: None,
    )


@pytest.fixture()
def make_category(session_factory):
    def _make(name):
        with session_factory() as db:
            row = ServiceCategory(category_name=name, description=name, is_active=True)
            db.add(row)
            db.commit()
            return row.category_id

    return _make