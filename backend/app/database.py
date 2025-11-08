from collections.abc import Generator
import time
from typing import Any

from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError

from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()


def _build_engine() -> Engine:
    engine_kwargs: dict[str, Any] = {"echo": settings.sql_echo, "pool_pre_ping": True}

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
        except OperationalError as exc:
            if attempt == max_attempts:
                raise
            time.sleep(backoff)
            backoff *= 2


def get_session() -> Generator[Session, None, None]:
    """Yield a SQLModel session for dependency injection."""
    with Session(engine) as session:
        yield session
