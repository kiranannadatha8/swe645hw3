# app/database.py

from collections.abc import Generator
import os
import time
from typing import Any

import pymysql
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()


def _mysql_creator():
    """
    DBAPI connection creator for MySQL using env vars directly.
    This bypasses any confusion with SQLAlchemy URL passwords.
    """
    host = os.environ["DB_HOST"]
    user = os.environ["DB_USER"]
    password = os.environ["DB_PASSWORD"]
    db = os.environ["DB_NAME"]
    port = int(os.environ.get("DB_PORT", "3306"))

    # IMPORTANT: do NOT use DictCursor here, SQLAlchemy expects tuple rows.
    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=db,  # or db=db, either is fine
        port=port,
        charset=settings.db_charset or "utf8mb4",
    )


def _build_engine() -> Engine:
    """
    Build a SQLAlchemy engine.

    In Kubernetes/RDS, we ALWAYS use a custom creator that calls pymysql.connect
    with DB_* env vars, so we know it's the same as your working raw test.
    """
    engine_kwargs: dict[str, Any] = {"echo": settings.sql_echo, "pool_pre_ping": True}

    # If we have DB_HOST etc, assume we're in MySQL/RDS mode
    if all(os.getenv(k) for k in ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]):
        # Use a dummy URL (no creds here); creator handles the real connection.
        database_uri = "mysql+pymysql://"
        engine_kwargs["creator"] = _mysql_creator
    else:
        # Fallback to whatever settings says (e.g., local SQLite dev)
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