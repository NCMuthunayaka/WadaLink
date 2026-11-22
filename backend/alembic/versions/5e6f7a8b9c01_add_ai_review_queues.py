"""add AI review queues and category proposals

Revision ID: 5e6f7a8b9c01
Revises: 4d5e6f7a8b90
"""
from alembic import op
import sqlalchemy as sa

revision = "5e6f7a8b9c01"
down_revision = "4d5e6f7a8b90"
branch_labels = None
depends_on = None


def upgrade():
    status = sa.String(20)
    op.create_table("llm_labeled_requests",
        sa.Column("labeled_id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("request_id", sa.BigInteger(), sa.ForeignKey("service_requests.request_id", ondelete="SET NULL")),
        sa.Column("input_text", sa.Text(), nullable=False),
        sa.Column("suggested_category", sa.String(100), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("status", status, nullable=False, server_default="pending"),
        sa.Column("reviewed_by", sa.BigInteger(), sa.ForeignKey("users.user_id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False))
    op.create_index("idx_llm_status", "llm_labeled_requests", ["status", "created_at"])
    op.create_table("category_proposals",
        sa.Column("proposal_id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.Text()),
        sa.Column("status", status, nullable=False, server_default="pending"),
        sa.Column("proposed_by", sa.BigInteger(), sa.ForeignKey("users.user_id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False))


def downgrade():
    op.drop_table("category_proposals")
    op.drop_index("idx_llm_status", table_name="llm_labeled_requests")
    op.drop_table("llm_labeled_requests")
