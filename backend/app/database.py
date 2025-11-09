from collections.abc import Generator
import os
import time
from typing import Any

from sqlalchemy.engine import Engine, URL
from sqlalchemy.exc import OperationalError

from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()


def _build_engine() -> Engine:
    """
    Build a SQLAlchemy engine.

    In Kubernetes/RDS, we ALWAYS build the DB URL from the DB_* environment
    variables so that the password from the Secret is used directly, and we
    avoid any stale values that might come from .env or defaults.
    """
    engine_kwargs: dict[str, Any] = {"echo": settings.sql_echo, "pool_pre_ping": True}

    # Prefer DB_* env vars supplied via Kubernetes Secret
    db_driver = os.getenv("DB_DRIVER", settings.db_driver)
    db_host = os.getenv("DB_HOST", settings.db_host or "")
    db_port = int(os.getenv("DB_PORT", str(settings.db_port)))
    db_user = os.getenv("DB_USER", settings.db_user or "")
    db_password = os.getenv("DB_PASSWORD", settings.db_password or "")
    db_name = os.getenv("DB_NAME", settings.db_name or "")
    db_charset = settings.db_charset

    if db_host and db_user and db_password and db_name:
        # Build URL from components using the real env password
        query = {"charset": db_charset} if db_charset else {}
        url = URL.create(
            drivername=db_driver,
            username=db_user,
            password=db_password,   # <- THIS will match DB_PASSWORD
            host=db_host,
            port=db_port,
            database=db_name,
            query=query,
        )
        database_uri = str(url)
    else:
        # Fallback for local dev / sqlite etc.
        database_uri = settings.sqlalchemy_database_uri

    if database_uri.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs.update(
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_pool_max_overflow,
            pool_recycle=settings.db_pool_recycle,
        )

    return create_engine(database_uri, **engine_kwargs)


engine = _build_engine()


def init_db(max_attempts: int = 8, initial_backoff: float = 1.0) -> None:
    """Create database tables based on SQLModel metadata, retrying until the DB is reachable."""
    backoff = initial_backoff
    for attempt in range(1, max_attempts + 1):
        try:
            SQLModel.metadata.create_all(engine)
            return
        except OperationalError:
            if attempt == max_attempts:
                raise
            time.sleep(backoff)
            backoff *= 2


def get_session() -> Generator[Session, None, None]:
    """Yield a SQLModel session for dependency injection."""
    with Session(engine) as session:
        yield session