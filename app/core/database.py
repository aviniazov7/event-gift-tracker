from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Single engine for the whole process; pool_pre_ping avoids serving
# connections that the database has already dropped.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Session factory — one SessionLocal() per request.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Declarative base that all ORM models will inherit from.
Base = declarative_base()
