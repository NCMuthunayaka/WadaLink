import pytest

from app.models.notification import Notification
from app.models.quotation import Quotation, QuotationStatus
from app.models.service_category import ServiceCategory
from app.models.service_request import RequestStatus, ServiceRequest
from tests.m1.helpers import API, bearer, register


@pytest.fixture(autouse=True)
def no_ai(monkeypatch):
    """Keep tests offline: skip the AI classification step."""
    monkeypatch.setattr(
        "app.api.v1.requests.ClassificationService.classify_request",
        lambda db, request: None,
    )


@pytest.fixture()
def token(client):
    return register(client, "cust@example.com").json()["access_token"]


@pytest.fixture()
def category(session_factory):
    with session_factory() as db:
        row = ServiceCategory(category_name="Plumbing", description="Pipes", is_active=True)
        db.add(row)
        db.commit()
        return row.category_id


def create_request(client, token, **over):
    body = {
        "title": "Leaking tap",
        "description": "Kitchen tap leaks",
        "address": "12 Beach Rd, Negombo",
        **over,
    }
    return client.post(f"{API}/requests", json=body, headers=bearer(token))


def set_row(session_factory, request_id, **fields):
    with session_factory() as db:
        row = db.get(ServiceRequest, int(request_id))
        for key, value in fields.items():
            setattr(row, key, value)
        db.commit()


def add_quotation(session_factory, request_id, provider_id, status=QuotationStatus.SUBMITTED):
    with session_factory() as db:
        db.add(
            Quotation(
                request_id=int(request_id),
                provider_id=provider_id,
                proposed_price=1500,
                status=status,
            )
        )
        db.commit()


def notifications_for(session_factory, user_id):
    with session_factory() as db:
        rows = db.query(Notification).filter(Notification.user_id == user_id).all()
        return [(n.event_type, n.message) for n in rows]


# ---------- create ----------

def test_create_accepts_and_returns_budget(client, token):
    res = create_request(client, token, budgetMin=1000, budgetMax=5000)
    assert res.status_code == 200
    assert res.json()["budgetMin"] == 1000.0
    assert res.json()["budgetMax"] == 5000.0


@pytest.mark.parametrize(
    "override",
    [
        {"urgency": "asap"},
        {"budgetMin": 5000, "budgetMax": 1000},
        {"budgetMin": -1},
        {"latitude": 123},
    ],
)
def test_create_rejects_invalid_input(client, token, override):
    assert create_request(client, token, **override).status_code == 422


# ---------- list ----------

def test_list_is_newest_first_with_filters_and_paging(client, token, session_factory):
    ids = [create_request(client, token, title=f"Job {i}").json()["id"] for i in range(3)]
    headers = bearer(token)

    rows = client.get(f"{API}/requests", headers=headers).json()
    assert [r["id"] for r in rows] == ids[::-1]

    page = client.get(f"{API}/requests?limit=1&offset=1", headers=headers).json()
    assert [r["id"] for r in page] == [ids[1]]

    set_row(session_factory, ids[0], status=RequestStatus.COMPLETED)
    done = client.get(f"{API}/requests?status=completed", headers=headers).json()
    assert [r["id"] for r in done] == [ids[0]]

    assert client.get(f"{API}/requests?status=nope", headers=headers).status_code == 422


def test_list_only_shows_own_requests(client, token):
    create_request(client, token)
    other = register(client, "other@example.com").json()["access_token"]
    assert client.get(f"{API}/requests", headers=bearer(other)).json() == []


# ---------- partial update ----------

def test_patch_changes_only_the_sent_fields(client, token):
    created = create_request(client, token, budgetMax=5000).json()
    res = client.patch(
        f"{API}/requests/{created['id']}", json={"title": "New title"}, headers=bearer(token)
    )
    body = res.json()
    assert res.status_code == 200
    assert body["title"] == "New title"
    assert body["description"] == created["description"]
    assert body["address"] == created["address"]
    assert body["budgetMax"] == 5000.0


def test_patch_still_accepts_a_full_body(client, token):
    created = create_request(client, token).json()
    full = {
        "title": "Full",
        "description": "Whole body update",
        "urgency": "high",
        "address": "New address",
    }
    res = client.patch(f"{API}/requests/{created['id']}", json=full, headers=bearer(token))
    assert res.status_code == 200
    assert res.json()["urgency"] == "high"


def test_patch_empty_body_changes_nothing(client, token):
    created = create_request(client, token).json()
    res = client.patch(f"{API}/requests/{created['id']}", json={}, headers=bearer(token))
    assert res.status_code == 200
    assert res.json()["title"] == created["title"]


def test_patch_category_can_be_set_and_cleared(client, token, category):
    created = create_request(client, token).json()
    url = f"{API}/requests/{created['id']}"
    set_res = client.patch(url, json={"categoryId": category}, headers=bearer(token))
    assert set_res.json()["categoryId"] == str(category)
    cleared = client.patch(url, json={"categoryId": None}, headers=bearer(token))
    assert cleared.json()["categoryId"] is None


def test_patch_validation_errors(client, token):
    created = create_request(client, token, budgetMin=1000).json()
    url = f"{API}/requests/{created['id']}"
    assert client.patch(url, json={"title": None}, headers=bearer(token)).status_code == 422
    assert client.patch(url, json={"categoryId": 9999}, headers=bearer(token)).status_code == 400
    # conflicts with the stored budgetMin of 1000
    assert client.patch(url, json={"budgetMax": 500}, headers=bearer(token)).status_code == 422


def test_patch_rejected_when_not_open_or_not_owner(client, token, session_factory):
    created = create_request(client, token).json()
    url = f"{API}/requests/{created['id']}"
    other = register(client, "other@example.com").json()["access_token"]
    assert client.patch(url, json={"title": "x" * 3}, headers=bearer(other)).status_code == 404

    set_row(session_factory, created["id"], status=RequestStatus.ASSIGNED)
    assert client.patch(url, json={"title": "Edited"}, headers=bearer(token)).status_code == 409


# ---------- cancel ----------

def test_cancel_open_request_notifies_providers_with_pending_quotes(client, token, session_factory):
    created = create_request(client, token).json()
    quoting = register(client, "p1@example.com", "provider").json()["user"]["user_id"]
    bystander = register(client, "p2@example.com", "provider").json()["user"]["user_id"]
    add_quotation(session_factory, created["id"], quoting)

    res = client.post(
        f"{API}/requests/{created['id']}/cancel",
        json={"reason": "Changed my mind"},
        headers=bearer(token),
    )
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"

    sent = notifications_for(session_factory, quoting)
    assert [event for event, _ in sent] == ["request_cancelled"]
    assert "Changed my mind" in sent[0][1]
    assert notifications_for(session_factory, bystander) == []


def test_cancel_works_without_a_body(client, token):
    created = create_request(client, token).json()
    res = client.post(f"{API}/requests/{created['id']}/cancel", headers=bearer(token))
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"


def test_cancel_assigned_request_notifies_selected_provider_once(client, token, session_factory):
    created = create_request(client, token).json()
    provider = register(client, "p1@example.com", "provider").json()["user"]["user_id"]
    add_quotation(session_factory, created["id"], provider, QuotationStatus.ACCEPTED)
    set_row(
        session_factory,
        created["id"],
        status=RequestStatus.ASSIGNED,
        selected_provider_id=provider,
    )

    res = client.post(f"{API}/requests/{created['id']}/cancel", headers=bearer(token))
    assert res.status_code == 200
    assert len(notifications_for(session_factory, provider)) == 1


@pytest.mark.parametrize(
    "blocked_status",
    [RequestStatus.CANCELLED, RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED],
)
def test_cancel_rejected_for_other_statuses(client, token, session_factory, blocked_status):
    created = create_request(client, token).json()
    set_row(session_factory, created["id"], status=blocked_status)
    res = client.post(f"{API}/requests/{created['id']}/cancel", headers=bearer(token))
    assert res.status_code == 409


def test_cancel_is_owner_and_customer_only(client, token):
    created = create_request(client, token).json()
    url = f"{API}/requests/{created['id']}/cancel"
    other = register(client, "other@example.com").json()["access_token"]
    provider = register(client, "p1@example.com", "provider").json()["access_token"]
    assert client.post(url, headers=bearer(other)).status_code == 404
    assert client.post(url, headers=bearer(provider)).status_code == 403


def test_cancelled_request_cannot_be_edited(client, token):
    created = create_request(client, token).json()
    client.post(f"{API}/requests/{created['id']}/cancel", headers=bearer(token))
    res = client.patch(
        f"{API}/requests/{created['id']}", json={"title": "Edited"}, headers=bearer(token)
    )
    assert res.status_code == 409