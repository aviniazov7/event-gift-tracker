from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables (or a local .env)."""

    # Full SQLAlchemy connection string, e.g.
    # postgresql+psycopg2://user:password@db:5432/giftledger
    DATABASE_URL: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Single shared settings instance imported across the app.
settings = Settings()
