"""Pydantic models for entity information extraction."""

from typing import Dict, List, Optional
from pydantic import BaseModel
from typing_extensions import TypedDict


class Resource(BaseModel):
    """A resource (URL or Wikipedia title) to fetch content from."""
    identifier: str  # URL or Wikipedia title
    type: str  # "wikipedia" or "web"
    language: Optional[str] = "en"  # For Wikipedia


class EntityData(BaseModel):
    """Extracted entity data."""
    name: str
    description: str
    population: Optional[int] = None


class AgentState(TypedDict):
    """State structure for the LangGraph agent."""
    # Input
    entity_input: str

    # Search results
    resources: List[Dict]  # List of resources found

    # Fetched content
    raw_content: str

    # Extracted data
    extracted_data: Optional[Dict]

    # Quality check
    is_complete: bool
    feedback: str  # Feedback from quality check (why incomplete)

    # Control flow
    iteration: int
