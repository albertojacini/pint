"""Request models for the API."""

from typing import Optional
from pydantic import BaseModel


class ResearchRequest(BaseModel):
    description: str
    entity_name: Optional[str] = None
    entity_id: Optional[str] = None


class ReviseRequest(BaseModel):
    feedback: str
