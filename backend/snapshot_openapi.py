"""Save the current OpenAPI schema so it can be diffed after each phase.

Usage (run from the backend folder, the one that contains app/ and .env):
    python snapshot_openapi.py before.json     # Phase 0 baseline
    python snapshot_openapi.py after.json      # after your changes
    python snapshot_openapi.py --diff before.json after.json
"""
import json
import sys


def snapshot(path):
    from app.main import app  # needs .env (DATABASE_URL, JWT_SECRET_KEY)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(app.openapi(), f, indent=2, sort_keys=True)
    print(f"saved {path}")


def routes(schema):
    out = {}
    for path, methods in schema["paths"].items():
        for method, op in methods.items():
            out[f"{method.upper()} {path}"] = json.dumps(op, sort_keys=True)
    return out


def diff(before_path, after_path):
    before = routes(json.load(open(before_path, encoding="utf-8")))
    after = routes(json.load(open(after_path, encoding="utf-8")))
    removed = sorted(set(before) - set(after))
    added = sorted(set(after) - set(before))
    changed = sorted(k for k in set(before) & set(after) if before[k] != after[k])
    print("REMOVED (must be empty):", *removed or ["none"], sep="\n  ")
    print("ADDED:", *added or ["none"], sep="\n  ")
    print("CHANGED (review each one):", *changed or ["none"], sep="\n  ")
    sys.exit(1 if removed else 0)


if __name__ == "__main__":
    if len(sys.argv) == 4 and sys.argv[1] == "--diff":
        diff(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 2:
        snapshot(sys.argv[1])
    else:
        print(__doc__)
