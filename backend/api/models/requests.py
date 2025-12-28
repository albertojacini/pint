"""Request models for the API."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    description: str
    entity_name: Optional[str] = None
    entity_id: Optional[str] = None
    agent_type: Literal["claude", "lcdeep"] = Field(
        default="claude",
        description="Which research agent to use: 'claude' (Claude SDK) or 'lcdeep' (LangChain Deep Agents)"
    )


class ReviseRequest(BaseModel):
    feedback: str
    agent_type: Literal["claude", "lcdeep"] = Field(
        default="claude",
        description="Which research agent to use: 'claude' (Claude SDK) or 'lcdeep' (LangChain Deep Agents)"
    )
