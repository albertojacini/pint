"""Data models for the search provision resources agent."""

from pydantic import BaseModel
from typing import Optional, List


class EntityInfo(BaseModel):
    """Political entity information."""
    id: str
    name: str
    language: str  # 'it', 'en', etc.


class URLValidationResult(BaseModel):
    """URL validation result with quality score."""
    url: str
    is_valid: bool
    score: int  # 0-10
    reason: str
    category_match: bool


class SearchResult(BaseModel):
    """Search result from BrightData."""
    url: str
    title: str
    snippet: str


class AgentResult(BaseModel):
    """Final result from agent execution."""
    entity_name: str
    urls_found: int
    urls_validated: int
    urls_inserted: int
    categories_searched: List[str]
