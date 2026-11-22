"""add AI audit fields and unmatched request table

Revision ID: 4d5e6f7a8b90
Revises: 3c4d5e6f7a80
"""
from alembic import op
import sqlalchemy as sa

revision = "4d5e6f7a8b90"
down_revision = "3c4d5e6f7a80"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("classification_logs", sa.Column("model_version", sa.String(100), nullable=True))
    op.add_column("classification_logs", sa.Column("layer", sa.String(50), nullable=True))
    op.create_table(
        "unmatched_requests",
        sa.Column("unmatched_id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("request_id", sa.BigInteger(), sa.ForeignKey("service_requests.request_id", ondelete="CASCADE"), nullable=False),
        sa.Column("input_text", sa.Text(), nullable=False),
        sa.Column("reason", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade():
    op.drop_table("unmatched_requests")
    op.drop_column("classification_logs", "layer")
    op.drop_column("classification_logs", "model_version")
