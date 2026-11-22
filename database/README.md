# WedaLink database

Neon PostgreSQL is the single database target for this project.

The normalized relational structure is represented by the SQLAlchemy models and
the Alembic revision in `backend/alembic/versions/`. The structure is in 3NF:

- users are separated from customer/provider role profiles;
- service categories, requests, classifications, scores and quotations are
  separate entities linked by foreign keys;
- equipment and reservations are separate entities;
- notifications, messages, reviews and admin logs are separate transaction or
  audit entities;
- repeated values such as roles, statuses and categories are not duplicated in
  transaction rows.

Use Alembic as the only schema source of truth for Neon PostgreSQL.

From `backend/` after installing dependencies:

```powershell
alembic upgrade head
```

Check the current migration:

```powershell
alembic current
```
