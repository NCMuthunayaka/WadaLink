from datetime import timedelta

import pytest

from app.core.security import create_access_token
from app.models.user import AccountStatus, User

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


def login(client, email, password):
    return client.post(f"{API}/auth/login", json={"email": email, "password": password})


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def set_status(session_factory, email, account_status):
    with session_factory() as db:
        user = db.query(User).filter(User.email == email).one()
        user.account_status = account_status
        db.commit()


# ---------- registration ----------

def test_register_customer_returns_token_and_active_user(client):
    res = register(client)
    assert res.status_code == 201
    data = res.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["user"]["role"] == "customer"
    assert data["user"]["account_status"] == "active"
    assert "password_hash" not in data["user"]


def test_register_provider_starts_pending(client):
    token = register(client, "bob@example.com", "provider").json()["access_token"]
    me = client.get(f"{API}/users/me", headers=bearer(token)).json()
    assert me["role"] == "provider"
    assert me["approvalStatus"] == "pending"


def test_register_duplicate_email_is_rejected_regardless_of_case(client):
    assert register(client).status_code == 201
    assert register(client, "ALICE@Example.com").status_code == 409


@pytest.mark.parametrize(
    "override",
    [
        {"password": "short"},
        {"role": "admin"},
        {"email": "not-an-email"},
        {"full_name": " "},
    ],
)
def test_register_rejects_invalid_input(client, override):
    assert register(client, **override).status_code == 422


# ---------- login ----------

def test_login_succeeds_and_email_is_case_insensitive(client):
    register(client)
    res = login(client, "ALICE@example.com", PASSWORD)
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_wrong_password_and_unknown_email_look_identical(client):
    register(client)
    wrong = login(client, "alice@example.com", "WrongPass123")
    unknown = login(client, "nobody@example.com", PASSWORD)
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


def test_suspended_account_cannot_log_in(client, session_factory):
    register(client)
    set_status(session_factory, "alice@example.com", AccountStatus.SUSPENDED)
    assert login(client, "alice@example.com", PASSWORD).status_code == 403


def test_login_verifies_a_hash_even_for_unknown_email(client, monkeypatch):
    from app.services import auth_service

    calls = []

    def spy(plain, hashed):
        calls.append(hashed)
        return False

    monkeypatch.setattr(auth_service, "verify_password", spy)
    res = login(client, "nobody@example.com", PASSWORD)
    assert res.status_code == 401
    assert len(calls) == 1


# ---------- token handling ----------

def test_me_works_with_valid_token(client):
    token = register(client).json()["access_token"]
    res = client.get(f"{API}/auth/me", headers=bearer(token))
    assert res.status_code == 200
    assert res.json()["email"] == "alice@example.com"


def test_me_rejects_missing_and_garbage_tokens(client):
    assert client.get(f"{API}/auth/me").status_code == 401
    assert client.get(f"{API}/auth/me", headers=bearer("garbage")).status_code == 401


def test_expired_token_is_rejected(client):
    user_id = register(client).json()["user"]["user_id"]
    expired = create_access_token(subject=user_id, expires_delta=timedelta(minutes=-1))
    assert client.get(f"{API}/auth/me", headers=bearer(expired)).status_code == 401


def test_token_for_unknown_user_is_rejected(client):
    token = create_access_token(subject=999999)
    assert client.get(f"{API}/auth/me", headers=bearer(token)).status_code == 401


def test_token_with_non_numeric_subject_is_rejected(client):
    token = create_access_token(subject="abc")
    assert client.get(f"{API}/auth/me", headers=bearer(token)).status_code == 401


def test_suspended_user_with_valid_token_gets_403(client, session_factory):
    token = register(client).json()["access_token"]
    set_status(session_factory, "alice@example.com", AccountStatus.SUSPENDED)
    assert client.get(f"{API}/auth/me", headers=bearer(token)).status_code == 403


# ---------- logout and roles ----------

def test_logout_requires_a_token(client):
    assert client.post(f"{API}/auth/logout").status_code == 401


def test_logout_returns_204_for_valid_session(client):
    token = register(client).json()["access_token"]
    res = client.post(f"{API}/auth/logout", headers=bearer(token))
    assert res.status_code == 204
    assert res.content == b""


def test_customer_cannot_use_provider_only_endpoint(client):
    token = register(client).json()["access_token"]
    res = client.get(f"{API}/users/me/provider/categories", headers=bearer(token))
    assert res.status_code == 403