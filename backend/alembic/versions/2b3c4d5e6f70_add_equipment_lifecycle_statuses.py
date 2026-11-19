"""add equipment rental lifecycle statuses

Revision ID: 2b3c4d5e6f70
Revises: 1a2b3c4d5e6f
"""

from alembic import op

revision = "2b3c4d5e6f70"
down_revision = "1a2b3c4d5e6f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE equipment_status ADD VALUE IF NOT EXISTS 'in_rent'")
    op.execute("ALTER TYPE equipment_status ADD VALUE IF NOT EXISTS 'return_pending'")
    op.execute("ALTER TYPE equipment_status ADD VALUE IF NOT EXISTS 'maintenance'")
    op.execute("ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'in_rent'")
    op.execute("ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'return_pending'")


def downgrade() -> None:
    # PostgreSQL does not safely remove enum values. A downgrade is intentionally
    # a no-op; the added values are backward-compatible.
    pass
