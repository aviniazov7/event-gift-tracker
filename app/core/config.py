from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables (or a local .env)."""

    # Full SQLAlchemy connection string, e.g.
    # postgresql+psycopg2://user:password@db:5432/giftledger
    DATABASE_URL: str

    # Comma-separated list of allowed CORS origins. Defaults to the local Vite
    # dev server; in production this is injected from the environment.
    CORS_ALLOW_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS_ALLOW_ORIGINS into a clean list of origins.

        A bare host without a scheme (e.g. how Render injects another service's
        host) is assumed to be https, so it matches the browser's Origin header.
        """
        origins: list[str] = []
        for raw in self.CORS_ALLOW_ORIGINS.split(","):
            origin = raw.strip()
            if not origin:
                continue
            if not origin.startswith(("http://", "https://")):
                origin = f"https://{origin}"
            origins.append(origin)
        return origins


# Single shared settings instance imported across the app.
settings = Settings()
