from __future__ import annotations

import json
from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    environment: Literal["local", "development", "production"] = "local"

    # Direct SQLAlchemy URL, primarily used for local development or single-string secrets
    database_url: str | None = Field(
        default=None,
        description=(
            "Full SQLAlchemy URL. Leave unset when using discrete DB_* secrets so the "
            "URL can be composed at runtime."
        ),
    )

    # Individual database components for Kubernetes secrets / AWS RDS
    db_driver: str = Field(default="mysql+pymysql", description="SQLAlchemy driver name")
    db_host: str | None = Field(default=None, description="Database host or endpoint")
    db_port: int = Field(default=3306, description="Database port")
    db_user: str | None = Field(default=None, description="Database username")
    db_password: str | None = Field(default=None, description="Database password")
    db_name: str | None = Field(default=None, description="Database/schema name")
    db_charset: str | None = Field(default="utf8mb4", description="Optional charset query param")

    # Connection pool tuning suitable for production workloads
    db_pool_size: int = Field(default=5, ge=1, description="Base SQLAlchemy pool size")
    db_pool_max_overflow: int = Field(
        default=10, ge=0, description="Additional connections allowed beyond the base pool"
    )
    db_pool_recycle: int = Field(
        default=1800, ge=0, description="Seconds before recycling a stale connection"
    )
    sql_echo: bool = Field(default=False, description="Enable SQLAlchemy engine echo for debugging")

    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        description="Allowed CORS origins for the API",
    )

    sqlite_fallback_url: str = Field(
        default="sqlite:///./student_surveys.db",
        description="Used automatically when running locally without DB env vars",
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            candidate = value.strip()
            if not candidate:
                return []
            try:
                parsed = json.loads(candidate)
            except json.JSONDecodeError:
                return [origin.strip() for origin in candidate.split(",") if origin.strip()]
            else:
                if not isinstance(parsed, list):
                    raise ValueError("CORS_ORIGINS JSON must be a list")
                return [str(origin).strip() for origin in parsed if str(origin).strip()]
        if isinstance(value, list):
            return value
        raise ValueError("CORS_ORIGINS must be a list or comma-delimited string")

    @property
    def sqlalchemy_database_uri(self) -> str:
        """Return a fully qualified database URI for SQLAlchemy/SQLModel."""

        # 1. Prefer discrete DB_* components (k8s/RDS)
        if self._has_db_components:
            return self._compose_db_url()

        # 2. Fall back to full DATABASE_URL for local / simple setups
        if self.database_url:
            return self.database_url

        # 3. Local dev fallback
        if self.environment == "local":
            return self.sqlite_fallback_url

        raise ValueError(
            "DATABASE_URL or DB_* secrets must be provided for non-local environments"
        )

    @property
    def _has_db_components(self) -> bool:
        return all((self.db_host, self.db_user, self.db_password, self.db_name))

    def _compose_db_url(self) -> str:
        query = {"charset": self.db_charset} if self.db_charset else {}
        return str(
            URL.create(
                drivername=self.db_driver,
                username=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
                query=query,
            )
        )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance to avoid re-parsing environment variables."""
    return Settings()
