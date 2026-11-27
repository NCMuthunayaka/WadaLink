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