"""track review decisions for unmatched service requests

Revision ID: 8h9i0j1k2l3m
Revises: 7g8h9i0j1k2l
"""
from alembic import op
import sqlalchemy as sa

revision = "8h9i0j1k2l3m"
down_revision = "7g8h9i0j1k2l"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "unmatched_requests",
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
    )
    op.add_column(
        "unmatched_requests",
        sa.Column("reviewed_by", sa.BigInteger(), nullable=True),
    )
    op.add_column(
        "unmatched_requests",
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
    )
    op.create_foreign_key(
        "fk_unmatched_requests_reviewed_by",
        "unmatched_requests",
        "users",
        ["reviewed_by"],
        ["user_id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "idx_unmatched_status_created",
        "unmatched_requests",
        ["status", "created_at"],
    )


def downgrade():
    op.drop_index("idx_unmatched_status_created", table_name="unmatched_requests")
    op.drop_constraint(
        "fk_unmatched_requests_reviewed_by",
        "unmatched_requests",
        type_="foreignkey",
    )
    op.drop_column("unmatched_requests", "reviewed_at")
    op.drop_column("unmatched_requests", "reviewed_by")
    op.drop_column("unmatched_requests", "status")
