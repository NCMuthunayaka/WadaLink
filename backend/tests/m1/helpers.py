from app.models.provider import ApprovalStatus, Provider
from app.models.quotation import Quotation, QuotationStatus
from app.models.service_request import ServiceRequest

API = "/api/v1"
PASSWORD = "Str0ngPass!"


def register(client, email="alice@example.com", role="customer", **extra):
    body = {
        "full_name": "Alice Perera",
        "email": email,
        "password": PASSWORD,
        "role": role,
        **extra,
    }
    return client.post(f"{API}/auth/register", json=body)


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def post_job(client, token, **over):
    body = {"title": "Job", "description": "Needs fixing", "address": "Somewhere", **over}
    res = client.post(f"{API}/requests", json=body, headers=bearer(token))
    assert res.status_code == 200
    return res.json()


def set_provider(session_factory, provider_id, **fields):
    with session_factory() as db:
        row = db.get(Provider, provider_id)
        for key, value in fields.items():
            setattr(row, key, value)
        db.commit()


def set_request(session_factory, request_id, **fields):
    with session_factory() as db:
        row = db.get(ServiceRequest, int(request_id))
        for key, value in fields.items():
            setattr(row, key, value)
        db.commit()


def add_quotation(session_factory, request_id, provider_id, status=QuotationStatus.SUBMITTED, price=1500):
    with session_factory() as db:
        db.add(
            Quotation(
                request_id=int(request_id),
                provider_id=provider_id,
                proposed_price=price,
                status=status,
            )
        )
        db.commit()


def provider_setup(client, session_factory, category_ids, email="prov@example.com", approved=True, **fields):
    data = register(client, email, "provider").json()
    token, provider_id = data["access_token"], data["user"]["user_id"]
    res = client.put(
        f"{API}/users/me/provider/categories",
        json={"categoryIds": category_ids},
        headers=bearer(token),
    )
    assert res.status_code == 200
    status = ApprovalStatus.APPROVED if approved else ApprovalStatus.PENDING
    set_provider(session_factory, provider_id, approval_status=status, **fields)
    return token, provider_id