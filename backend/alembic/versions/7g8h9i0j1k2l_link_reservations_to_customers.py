"""link equipment reservations to customers

Revision ID: 7g8h9i0j1k2l
Revises: 6f7a8b9c0123
Create Date: 2026-11-22
"""

from alembic import op


revision = "7g8h9i0j1k2l"
down_revision = "6f7a8b9c0123"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint(
        "equipment_reservations_renter_provider_id_fkey",
        "equipment_reservations",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_equipment_reservations_renter_provider_id",
        table_name="equipment_reservations",
    )
    op.alter_column(
        "equipment_reservations",
        "renter_provider_id",
        new_column_name="renter_customer_id",
    )
    op.create_foreign_key(
        "equipment_reservations_renter_customer_id_fkey",
        "equipment_reservations",
        "customers",
        ["renter_customer_id"],
        ["customer_id"],
        onupdate="CASCADE",
        ondelete="RESTRICT",
    )
    op.create_index(
        "ix_equipment_reservations_renter_customer_id",
        "equipment_reservations",
        ["renter_customer_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_constraint(
        "equipment_reservations_renter_customer_id_fkey",
        "equipment_reservations",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_equipment_reservations_renter_customer_id",
        table_name="equipment_reservations",
    )
    op.alter_column(
        "equipment_reservations",
        "renter_customer_id",
        new_column_name="renter_provider_id",
    )
    op.create_foreign_key(
        "equipment_reservations_renter_provider_id_fkey",
        "equipment_reservations",
        "providers",
        ["renter_provider_id"],
        ["provider_id"],
        onupdate="CASCADE",
        ondelete="RESTRICT",
    )
    op.create_index(
        "ix_equipment_reservations_renter_provider_id",
        "equipment_reservations",
        ["renter_provider_id"],
        unique=False,
    )
