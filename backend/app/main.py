from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router
from .config import get_settings
from .database import init_db

settings = get_settings()

app = FastAPI(title="SWE 645 Student Survey API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def handle_startup() -> None:
    """Initialize database schema when the application starts."""
    init_db()


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    """Basic readiness probe endpoint."""
    return {"status": "ok"}


app.include_router(api_router)

