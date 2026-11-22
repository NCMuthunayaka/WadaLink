"""add AI model registry

Revision ID: 6f7a8b9c0123
Revises: 5e6f7a8b9c01
"""
from alembic import op
import sqlalchemy as sa

revision = "6f7a8b9c0123"
down_revision = "5e6f7a8b9c01"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("ai_model_registry",
        sa.Column("model_id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("model_name", sa.String(100), nullable=False),
        sa.Column("model_version", sa.String(100), nullable=False, unique=True),
        sa.Column("artifact_path", sa.String(255), nullable=False),
        sa.Column("validation_accuracy", sa.Float(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="candidate"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False))


def downgrade():
    op.drop_table("ai_model_registry")
