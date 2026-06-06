from logging.config import fileConfig

from alembic import context

# Pull the connection string, engine and metadata from the application itself so
# the migrations always match the live config and the declared models — and so
# the startup migration uses the same SSL / pool-pre-ping engine (needed for an
# external serverless Postgres like Neon).
from app.core.config import settings
from app.core.database import Base, engine

# Importing the models package registers every table on Base.metadata,
# which is what autogenerate diffs against.
import app.models  # noqa: F401

config = context.config

# Inject the runtime DATABASE_URL (env / .env) into Alembic's config.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emit SQL without a DBAPI connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode against a live connection, reusing the
    app's engine (SSL + pool_pre_ping) so it works against external Postgres."""
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
