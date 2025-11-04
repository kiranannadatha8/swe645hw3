from collections.abc import Generator
import time

from sqlalchemy.exc import OperationalError

from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()

# mysql requires ?charset=utf8mb4 for unicode; leave to user to include in URL if needed
engine = create_engine(settings.database_url, echo=settings.sql_echo, pool_pre_ping=True)


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
