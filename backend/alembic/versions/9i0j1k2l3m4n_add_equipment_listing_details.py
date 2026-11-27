"""persist equipment listing details accepted by the API

Revision ID: 9i0j1k2l3m4n
Revises: 8h9i0j1k2l3m
"""
from alembic import op
import sqlalchemy as sa

revision = "9i0j1k2l3m4n"
down_revision = "8h9i0j1k2l3m"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("equipment", sa.Column("image_url", sa.String(length=2048), nullable=True))
    op.add_column(
        "equipment",
        sa.Column("delivery_fee", sa.Numeric(10, 2), nullable=False, server_default="0"),
    )
    op.add_column(
        "equipment",
        sa.Column("delivery_radius", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("equipment", sa.Column("tags", sa.JSON(), nullable=True))
    op.add_column("equipment", sa.Column("pickup_location", sa.String(length=255), nullable=True))
    op.add_column("equipment", sa.Column("return_location", sa.String(length=255), nullable=True))
    op.create_check_constraint("chk_eq_delivery_fee", "equipment", "delivery_fee >= 0")
    op.create_check_constraint("chk_eq_delivery_radius", "equipment", "delivery_radius >= 0")


def downgrade():
    op.drop_constraint("chk_eq_delivery_radius", "equipment", type_="check")
    op.drop_constraint("chk_eq_delivery_fee", "equipment", type_="check")
    op.drop_column("equipment", "return_location")
    op.drop_column("equipment", "pickup_location")
    op.drop_column("equipment", "tags")
    op.drop_column("equipment", "delivery_radius")
    op.drop_column("equipment", "delivery_fee")
    op.drop_column("equipment", "image_url")
