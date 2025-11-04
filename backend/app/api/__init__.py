from fastapi import APIRouter

from .surveys import router as surveys_router

api_router = APIRouter(prefix="/api")
api_router.include_router(surveys_router, prefix="/surveys", tags=["surveys"])

__all__ = ["api_router"]

