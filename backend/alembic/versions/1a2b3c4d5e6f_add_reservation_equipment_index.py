"""align reservation equipment index with ORM model

Revision ID: 1a2b3c4d5e6f
Revises: ea086e8dc991
"""

from alembic import op


revision = "1a2b3c4d5e6f"
down_revision = "ea086e8dc991"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_equipment_reservations_equipment_id",
        "equipment_reservations",
        ["equipment_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_equipment_reservations_equipment_id",
        table_name="equipment_reservations",
    )
