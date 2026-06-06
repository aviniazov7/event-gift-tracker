"""The engine options must require SSL for a remote (Neon) Postgres but leave
local Postgres and SQLite untouched, and always enable pool_pre_ping."""

from sqlalchemy.engine import make_url

from app.core.database import engine_options


def test_remote_postgres_requires_ssl_and_recycles():
    connect_args, kwargs = engine_options(
        make_url("postgresql+psycopg2://u:p@ep-cool-pooler.eu-central-1.aws.neon.tech/giftledger")
    )
    assert connect_args["sslmode"] == "require"
    assert kwargs["pool_pre_ping"] is True
    assert kwargs["pool_recycle"] == 300


def test_local_postgres_is_not_forced_to_ssl():
    for host in ("db", "localhost", "127.0.0.1"):
        connect_args, _ = engine_options(
            make_url(f"postgresql+psycopg2://u:p@{host}:5432/giftledger")
        )
        assert "sslmode" not in connect_args


def test_url_sslmode_is_respected_not_overridden():
    connect_args, _ = engine_options(
        make_url("postgresql+psycopg2://u:p@ep-x.aws.neon.tech/db?sslmode=verify-full")
    )
    # Already specified in the URL → we don't add our own.
    assert "sslmode" not in connect_args


def test_sqlite_gets_no_postgres_options():
    connect_args, kwargs = engine_options(make_url("sqlite://"))
    assert connect_args == {}
    assert "pool_recycle" not in kwargs
    assert kwargs["pool_pre_ping"] is True
