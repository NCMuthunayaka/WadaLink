"""add provider matching data

Revision ID: 3c4d5e6f7a80
Revises: 2b3c4d5e6f70
"""
from alembic import op
import sqlalchemy as sa

revision = "3c4d5e6f7a80"
down_revision = "2b3c4d5e6f70"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("providers", sa.Column("latitude", sa.Numeric(10, 7), nullable=True))
    op.add_column("providers", sa.Column("longitude", sa.Numeric(10, 7), nullable=True))
    op.add_column("providers", sa.Column("response_time_minutes", sa.Integer(), server_default="60", nullable=False))
    op.create_table("provider_service_categories",
        sa.Column("provider_id", sa.BigInteger(), nullable=False),
        sa.Column("category_id", sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(["provider_id"], ["providers.provider_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["service_categories.category_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("provider_id", "category_id"))


def downgrade():
    op.drop_table("provider_service_categories")
    op.drop_column("providers", "response_time_minutes")
    op.drop_column("providers", "longitude")
    op.drop_column("providers", "latitude")
