from decimal import Decimal

from app.models.provider import ApprovalStatus, Provider
from app.models.quotation import Quotation, QuotationStatus
from app.models.service_request import RequestStatus, ServiceRequest
from tests.m1.helpers import API, bearer, register

LEGACY_KEYS = ("id", "title", "description", "address", "urgency", "categoryId", "createdAt")


def customer_token(client, email="cust@example.com"):
    return register(client, email).json()["access_token"]


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


def add_quotation(session_factory, request_id, provider_id):
    with session_factory() as db:
        db.add(Quotation(request_id=int(request_id), provider_id=provider_id, proposed_price=1500))
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


def jobs(client, token, query=""):
    return client.get(f"{API}/providers/jobs{query}", headers=bearer(token))


def titles(response):
    return [row["title"] for row in response.json()]


# ---------- listing ----------

def test_lists_only_open_jobs_in_provider_categories(client, session_factory, make_category):
    plumbing, electrical = make_category("Plumbing"), make_category("Electrical")
    customer = customer_token(client)
    mine = post_job(client, customer, categoryId=plumbing, title="Mine")
    post_job(client, customer, categoryId=electrical, title="Other category")
    post_job(client, customer, title="Uncategorised")
    cancelled = post_job(client, customer, categoryId=plumbing, title="Cancelled")
    client.post(f"{API}/requests/{cancelled['id']}/cancel", headers=bearer(customer))

    token, _ = provider_setup(client, session_factory, [plumbing])
    res = jobs(client, token)
    assert res.status_code == 200
    rows = res.json()
    assert titles(res) == ["Mine"]
    for key in LEGACY_KEYS:
        assert key in rows[0]
    assert rows[0]["id"] == int(mine["id"])
    assert rows[0]["categoryName"] == "Plumbing"


def test_provider_without_categories_sees_nothing(client, session_factory):
    post_job(client, customer_token(client))
    token, _ = provider_setup(client, session_factory, [])
    assert jobs(client, token).json() == []


def test_include_uncategorized_is_opt_in(client, session_factory, make_category):
    plumbing = make_category("Plumbing")
    customer = customer_token(client)
    post_job(client, customer, categoryId=plumbing, title="Mine")
    post_job(client, customer, title="Uncategorised")
    token, _ = provider_setup(client, session_factory, [plumbing])

    assert titles(jobs(client, token)) == ["Mine"]
    both = titles(jobs(client, token, "?includeUncategorized=true"))
    assert set(both) == {"Mine", "Uncategorised"}


def test_category_and_urgency_filters(client, session_factory, make_category):
    plumbing, electrical = make_category("Plumbing"), make_category("Electrical")
    customer = customer_token(client)
    post_job(client, customer, categoryId=plumbing, title="Low", urgency="low")
    post_job(client, customer, categoryId=electrical, title="High", urgency="high")
    token, _ = provider_setup(client, session_factory, [plumbing, electrical])

    assert titles(jobs(client, token, f"?categoryId={plumbing}")) == ["Low"]
    assert titles(jobs(client, token, "?urgency=high")) == ["High"]
    # a category the provider does not offer gives an empty list
    assert jobs(client, token, "?categoryId=9999").json() == []
    assert jobs(client, token, "?urgency=asap").status_code == 422


def test_default_order_is_newest_first_and_paging_works(client, session_factory, make_category):
    cat = make_category("Plumbing")
    customer = customer_token(client)
    for i in range(3):
        post_job(client, customer, categoryId=cat, title=f"Job {i}")
    token, _ = provider_setup(client, session_factory, [cat])

    assert titles(jobs(client, token)) == ["Job 2", "Job 1", "Job 0"]
    assert titles(jobs(client, token, "?limit=2&offset=1")) == ["Job 1", "Job 0"]


def test_urgency_sort_puts_emergencies_first(client, session_factory, make_category):
    cat = make_category("Plumbing")
    customer = customer_token(client)
    post_job(client, customer, categoryId=cat, title="Low", urgency="low")
    post_job(client, customer, categoryId=cat, title="Emergency", urgency="emergency")
    post_job(client, customer, categoryId=cat, title="Medium", urgency="medium")
    token, _ = provider_setup(client, session_factory, [cat])

    assert titles(jobs(client, token, "?sort=urgency")) == ["Emergency", "Medium", "Low"]


def test_distance_filters_and_nearest_sort(client, session_factory, make_category):
    cat = make_category("Plumbing")
    customer = customer_token(client)
    post_job(client, customer, categoryId=cat, title="Near", latitude=6.93, longitude=79.86)
    post_job(client, customer, categoryId=cat, title="Far", latitude=7.2906, longitude=80.6337)
    post_job(client, customer, categoryId=cat, title="Unknown")
    token, _ = provider_setup(
        client,
        session_factory,
        [cat],
        latitude=Decimal("6.9271"),
        longitude=Decimal("79.8612"),
    )

    res = jobs(client, token, "?sort=nearest")
    rows = res.json()
    assert titles(res) == ["Near", "Far", "Unknown"]
    assert rows[0]["distanceKm"] < 5
    assert rows[1]["distanceKm"] > 50
    assert rows[2]["distanceKm"] is None
    assert [r["withinServiceRadius"] for r in rows] == [True, False, None]

    assert titles(jobs(client, token, "?maxDistanceKm=10")) == ["Near"]
    in_radius = jobs(client, token, "?withinServiceRadius=true&sort=nearest")
    assert titles(in_radius) == ["Near", "Unknown"]


def test_quote_flags(client, session_factory, make_category):
    cat = make_category("Plumbing")
    job = post_job(client, customer_token(client), categoryId=cat)
    token, provider_id = provider_setup(client, session_factory, [cat], approved=False)

    row = jobs(client, token).json()[0]
    assert row["canQuote"] is False  # not approved yet
    assert row["alreadyQuoted"] is False

    set_provider(session_factory, provider_id, approval_status=ApprovalStatus.APPROVED)
    row = jobs(client, token).json()[0]
    assert row["canQuote"] is True
    assert row["quotationCount"] == 0

    add_quotation(session_factory, job["id"], provider_id)
    row = jobs(client, token).json()[0]
    assert row["alreadyQuoted"] is True
    assert row["canQuote"] is False
    assert row["quotationStatus"] == "submitted"
    assert row["quotationCount"] == 1
    assert row["quotationId"] is not None


def test_customer_cannot_use_provider_jobs(client):
    token = customer_token(client)
    assert jobs(client, token).status_code == 403


# ---------- detail ----------

def test_job_detail_visibility(client, session_factory, make_category):
    plumbing, electrical = make_category("Plumbing"), make_category("Electrical")
    customer = customer_token(client)
    mine = post_job(client, customer, categoryId=plumbing)
    other = post_job(client, customer, categoryId=electrical)
    token, _ = provider_setup(client, session_factory, [plumbing])

    ok = client.get(f"{API}/providers/jobs/{mine['id']}", headers=bearer(token))
    assert ok.status_code == 200
    body = ok.json()
    assert body["status"] == "open"
    assert body["myQuotation"] is None
    assert body["customerName"] is None
    assert client.get(f"{API}/providers/jobs/{other['id']}", headers=bearer(token)).status_code == 404
    assert client.get(f"{API}/providers/jobs/999999", headers=bearer(token)).status_code == 404


def test_job_detail_stays_visible_after_quote_and_cancel(client, session_factory, make_category):
    cat = make_category("Plumbing")
    customer = customer_token(client)
    job = post_job(client, customer, categoryId=cat)
    token, provider_id = provider_setup(client, session_factory, [cat])
    add_quotation(session_factory, job["id"], provider_id)
    client.post(f"{API}/requests/{job['id']}/cancel", headers=bearer(customer))

    res = client.get(f"{API}/providers/jobs/{job['id']}", headers=bearer(token))
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"
    assert res.json()["myQuotation"]["status"] == "submitted"
    assert res.json()["canQuote"] is False


def test_customer_name_is_revealed_only_to_the_selected_provider(client, session_factory, make_category):
    cat = make_category("Plumbing")
    job = post_job(client, customer_token(client), categoryId=cat)
    token, provider_id = provider_setup(client, session_factory, [cat])
    set_request(
        session_factory,
        job["id"],
        status=RequestStatus.ASSIGNED,
        selected_provider_id=provider_id,
    )
    res = client.get(f"{API}/providers/jobs/{job['id']}", headers=bearer(token))
    assert res.status_code == 200
    assert res.json()["customerName"] == "Alice Perera"