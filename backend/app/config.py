from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    database_url: str = Field(
        default="sqlite:///./student_surveys.db",
        description="SQLAlchemy compatible database URL (e.g., mysql+pymysql://user:pass@host/db)",
    )
    sql_echo: bool = Field(default=False, description="Enable SQLAlchemy engine echo for debugging")
    cors_origins: list[str] = Field(
        default=["http://localhost:5173"],
        description="Allowed CORS origins for the API",
    )
    environment: Literal["local", "development", "production"] = "local"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # @field_validator("cors_origins", mode="before")
    # @classmethod
    # def parse_cors_origins(cls, value: object) -> list[str]:
    #     if isinstance(value, str):
    #         return [origin.strip() for origin in value.split(",") if origin.strip()]
    #     return value


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance to avoid re-parsing environment variables."""
    return Settings()
