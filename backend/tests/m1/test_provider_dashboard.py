from app.models.notification import Notification
from app.models.quotation import QuotationStatus
from app.models.review import Review
from app.models.service_request import RequestStatus
from tests.m1.helpers import (
    API,
    add_quotation,
    bearer,
    post_job,
    provider_setup,
    register,
    set_request,
)


def customer(client, email="cust@example.com"):
    data = register(client, email).json()
    return data["access_token"], data["user"]["user_id"]


def get(client, token, path):
    return client.get(f"{API}/providers{path}", headers=bearer(token))


def post(client, token, path):
    return client.post(f"{API}/providers{path}", headers=bearer(token))


def notification_events(session_factory, user_id):
    with session_factory() as db:
        rows = (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.notification_id)
            .all()
        )
        return [row.event_type for row in rows]


# ---------- dashboard ----------

def test_dashboard_for_a_new_provider_is_empty(client, session_factory):
    token, _ = provider_setup(client, session_factory, [], approved=False)
    res = get(client, token, "/dashboard")
    assert res.status_code == 200
    body = res.json()
    assert body["approvalStatus"] == "pending"
    assert body["canQuote"] is False
    assert body["categoryCount"] == 0
    assert body["rating"] is None
    assert body["openJobsAvailable"] == 0
    assert body["quotations"] == {
        "submitted": 0, "accepted": 0, "rejected": 0, "withdrawn": 0, "cancelled": 0,
    }
    assert body["jobs"] == {"assigned": 0, "inProgress": 0, "completed": 0, "cancelled": 0}
    assert body["activeJobs"] == []


def test_dashboard_counts_everything(client, session_factory, make_category):
    cat = make_category("Plumbing")
    cust_token, cust_id = customer(client)
    token, pid = provider_setup(client, session_factory, [cat])

    quoted_open = post_job(client, cust_token, categoryId=cat, title="Quoted open")
    assigned = post_job(client, cust_token, categoryId=cat, title="Assigned")
    done = post_job(client, cust_token, categoryId=cat, title="Done")
    cancelled = post_job(client, cust_token, categoryId=cat, title="Cancelled")
    post_job(client, cust_token, categoryId=cat, title="Fresh")

    add_quotation(session_factory, quoted_open["id"], pid)
    add_quotation(session_factory, assigned["id"], pid, QuotationStatus.ACCEPTED)
    add_quotation(session_factory, done["id"], pid, QuotationStatus.ACCEPTED)
    add_quotation(session_factory, cancelled["id"], pid)
    set_request(session_factory, assigned["id"], status=RequestStatus.ASSIGNED, selected_provider_id=pid)
    set_request(session_factory, done["id"], status=RequestStatus.COMPLETED, selected_provider_id=pid)
    set_request(session_factory, cancelled["id"], status=RequestStatus.CANCELLED)
    with session_factory() as db:
        db.add(Review(request_id=int(done["id"]), reviewer_id=cust_id, reviewee_id=pid, rating=4))
        db.commit()

    body = get(client, token, "/dashboard").json()
    assert body["approvalStatus"] == "approved"
    assert body["canQuote"] is True
    assert body["categoryCount"] == 1
    assert body["openJobsAvailable"] == 1  # only "Fresh": the other open job is already quoted
    assert body["quotations"] == {
        "submitted": 1, "accepted": 2, "rejected": 0, "withdrawn": 0, "cancelled": 1,
    }
    assert body["jobs"] == {"assigned": 1, "inProgress": 0, "completed": 1, "cancelled": 0}
    assert body["completedJobsValue"] == 1500.0
    assert body["rating"] == 4.0
    assert body["reviewCount"] == 1
    assert [job["title"] for job in body["activeJobs"]] == ["Assigned"]


def test_dashboard_is_provider_only(client):
    token, _ = customer(client)
    assert get(client, token, "/dashboard").status_code == 403


# ---------- my jobs / my quotations ----------

def test_my_jobs_lists_only_own_selected_jobs(client, session_factory, make_category):
    cat = make_category("Plumbing")
    cust_token, _ = customer(client)
    token, pid = provider_setup(client, session_factory, [cat])
    _, other_pid = provider_setup(client, session_factory, [cat], email="p2@example.com")

    mine = post_job(client, cust_token, categoryId=cat, title="Mine")
    theirs = post_job(client, cust_token, categoryId=cat, title="Theirs")
    post_job(client, cust_token, categoryId=cat, title="Still open")
    add_quotation(session_factory, mine["id"], pid, QuotationStatus.ACCEPTED)
    set_request(session_factory, mine["id"], status=RequestStatus.ASSIGNED, selected_provider_id=pid)
    set_request(session_factory, theirs["id"], status=RequestStatus.ASSIGNED, selected_provider_id=other_pid)

    rows = get(client, token, "/my-jobs").json()
    assert [row["id"] for row in rows] == [int(mine["id"])]
    assert rows[0]["status"] == "assigned"
    assert rows[0]["customerName"] == "Alice Perera"
    assert rows[0]["agreedPrice"] == 1500.0
    assert rows[0]["categoryName"] == "Plumbing"

    assert get(client, token, "/my-jobs?status=completed").json() == []
    assert get(client, token, "/my-jobs?status=bogus").status_code == 422


def test_my_quotations_report_effective_status(client, session_factory, make_category):
    cat = make_category("Plumbing")
    cust_token, _ = customer(client)
    token, pid = provider_setup(client, session_factory, [cat])

    open_job = post_job(client, cust_token, categoryId=cat, title="Open")
    rejected_job = post_job(client, cust_token, categoryId=cat, title="Rejected")
    cancelled_job = post_job(client, cust_token, categoryId=cat, title="Cancelled")
    add_quotation(session_factory, open_job["id"], pid)
    add_quotation(session_factory, rejected_job["id"], pid, QuotationStatus.REJECTED)
    add_quotation(session_factory, cancelled_job["id"], pid)
    set_request(session_factory, cancelled_job["id"], status=RequestStatus.CANCELLED)

    rows = get(client, token, "/my-quotations").json()
    by_title = {row["requestTitle"]: row for row in rows}
    assert by_title["Open"]["effectiveStatus"] == "submitted"
    assert by_title["Rejected"]["effectiveStatus"] == "rejected"
    assert by_title["Cancelled"]["effectiveStatus"] == "cancelled"
    assert by_title["Cancelled"]["status"] == "submitted"

    submitted = get(client, token, "/my-quotations?status=submitted").json()
    assert [row["requestTitle"] for row in submitted] == ["Open"]
    cancelled = get(client, token, "/my-quotations?status=cancelled").json()
    assert [row["requestTitle"] for row in cancelled] == ["Cancelled"]
    assert get(client, token, "/my-quotations?status=bogus").status_code == 422


# ---------- start / complete ----------

def test_start_and_complete_flow_notifies_the_customer(client, session_factory, make_category):
    cat = make_category("Plumbing")
    cust_token, cust_id = customer(client)
    token, pid = provider_setup(client, session_factory, [cat])
    job = post_job(client, cust_token, categoryId=cat)
    set_request(session_factory, job["id"], status=RequestStatus.ASSIGNED, selected_provider_id=pid)

    assert post(client, token, f"/jobs/{job['id']}/complete").status_code == 409  # not started

    started = post(client, token, f"/jobs/{job['id']}/start")
    assert started.status_code == 200
    assert started.json()["status"] == "in_progress"
    assert post(client, token, f"/jobs/{job['id']}/start").status_code == 409  # twice

    # Phase 3 rule: a job in progress can no longer be cancelled by the customer
    cancel = client.post(f"{API}/requests/{job['id']}/cancel", headers=bearer(cust_token))
    assert cancel.status_code == 409

    done = post(client, token, f"/jobs/{job['id']}/complete")
    assert done.status_code == 200
    assert done.json()["status"] == "completed"
    assert post(client, token, f"/jobs/{job['id']}/complete").status_code == 409

    assert notification_events(session_factory, cust_id) == ["job_started", "job_completed"]


def test_job_transitions_are_restricted(client, session_factory, make_category):
    cat = make_category("Plumbing")
    cust_token, _ = customer(client)
    token, pid = provider_setup(client, session_factory, [cat])
    other_token, _ = provider_setup(client, session_factory, [cat], email="p2@example.com")
    job = post_job(client, cust_token, categoryId=cat)
    set_request(session_factory, job["id"], status=RequestStatus.ASSIGNED, selected_provider_id=pid)

    assert post(client, other_token, f"/jobs/{job['id']}/start").status_code == 404
    assert post(client, cust_token, f"/jobs/{job['id']}/start").status_code == 403
    assert post(client, token, "/jobs/999999/start").status_code == 404

    set_request(session_factory, job["id"], status=RequestStatus.CANCELLED)
    assert post(client, token, f"/jobs/{job['id']}/start").status_code == 409