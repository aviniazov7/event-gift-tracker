"""add owner_id to persons, events, transactions

Revision ID: b2c3d4e5f6a7
Revises: a1f2c3d4e5f6
Create Date: 2026-06-05 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1f2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLES = ("persons", "events", "transactions")


def upgrade() -> None:
    # Pre-auth demo rows have no owner. Per the rollout plan we clear them so
    # the NOT NULL owner_id column can be added cleanly. Delete transactions
    # first to respect the existing person/event foreign keys.
    op.execute("DELETE FROM transactions")
    op.execute("DELETE FROM persons")
    op.execute("DELETE FROM events")

    for table in _TABLES:
        op.add_column(
            table, sa.Column("owner_id", sa.Integer(), nullable=False)
        )
        op.create_index(f"ix_{table}_owner_id", table, ["owner_id"])
        op.create_foreign_key(
            f"fk_{table}_owner_id_users", table, "users", ["owner_id"], ["id"]
        )


def downgrade() -> None:
    for table in reversed(_TABLES):
        op.drop_constraint(
            f"fk_{table}_owner_id_users", table, type_="foreignkey"
        )
        op.drop_index(f"ix_{table}_owner_id", table_name=table)
        op.drop_column(table, "owner_id")
