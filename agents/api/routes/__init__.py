"""API routes."""

from api.routes.classify import router as classify_router
from api.routes.research import router as research_router

__all__ = ["classify_router", "research_router"]
