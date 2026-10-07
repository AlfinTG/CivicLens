"""Create the legacy issues table for fresh databases.

Revision ID: 0001_legacy_issues
Revises:
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "0001_legacy_issues"
down_revision = None
branch_labels = None
depends_on = None

REQUIRED_LEGACY_COLUMNS = {
    "id",
    "type",
    "severity",
    "description",
    "department",
    "confidence",
    "lat",
    "lng",
    "image_url",
    "note",
    "status",
    "duplicate_count",
    "priority_score",
    "created_at",
}


def upgrade():
    connection = op.get_bind()
    inspector = inspect(connection)
    tables = set(inspector.get_table_names())

    if "issues" not in tables:
        op.create_table(
            "issues",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("type", sa.String(), nullable=False),
            sa.Column("severity", sa.Integer(), nullable=False),
            sa.Column("description", sa.String(), nullable=False),
            sa.Column("department", sa.String(), nullable=False),
            sa.Column("confidence", sa.Float(), nullable=False),
            sa.Column("lat", sa.Float(), nullable=False),
            sa.Column("lng", sa.Float(), nullable=False),
            sa.Column("image_url", sa.String(), nullable=False),
            sa.Column("note", sa.String(), nullable=False),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column("duplicate_count", sa.Integer(), nullable=False),
            sa.Column("priority_score", sa.Float(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
    else:
        existing_columns = {column["name"] for column in inspector.get_columns("issues")}
        missing = REQUIRED_LEGACY_COLUMNS - existing_columns
        if missing:
            raise RuntimeError(
                "Cannot baseline the existing issues table; missing columns: "
                + ", ".join(sorted(missing))
                + ". Back up the database and write an explicit data migration."
            )

    existing_indexes = {index["name"] for index in inspect(connection).get_indexes("issues")}
    for column in ("id", "type", "status", "department", "created_at"):
        name = f"ix_issues_{column}"
        if name not in existing_indexes:
            op.create_index(name, "issues", [column], unique=False)


def downgrade():
    # The baseline may describe a pre-existing production table. Dropping it
    # would destroy data, so the initial downgrade intentionally preserves it.
    pass
