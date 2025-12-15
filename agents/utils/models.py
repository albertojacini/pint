"""Base models for research agents."""

from enum import Enum
from pydantic import BaseModel, Field


class ResearchStatus(str, Enum):
    """Common status for research outputs.

    - active: Currently in effect
    - repealed: No longer in effect
    - suspended: Temporarily inactive
    """
    ACTIVE = "active"
    REPEALED = "repealed"
    SUSPENDED = "suspended"


class BaseResearchOutput(BaseModel):
    """Base model for all research agent outputs.

    Contains common fields shared across regulation, taxation, ownership, etc.
    Domain-specific agents inherit from this and add their own fields.
    """

    # Basic identification
    title: str = Field(
        description="Official name in original language, clear and recognizable"
    )
    description: str = Field(
        description="2-3 sentence explanation of purpose and key aspects"
    )
    status: ResearchStatus = Field(
        description="Current status (active, repealed, or suspended)"
    )

    # Temporal validity
    effectiveFrom: str | None = Field(
        None,
        description="When it took effect (YYYY-MM-DD format)"
    )
    effectiveUntil: str | None = Field(
        None,
        description="When it ended/will end (YYYY-MM-DD format, null if still active)"
    )

    # Sources and confidence
    sourceUrls: list[str] = Field(
        default_factory=list,
        description="List of authoritative URLs used as sources"
    )
    confidence: float = Field(
        ge=0,
        le=1,
        description=(
            "Confidence score (0-1) based on source quality. "
            "0.9-1.0: Multiple official sources. "
            "0.7-0.8: Good sources, some gaps. "
            "0.5-0.6: Mixed sources. "
            "<0.5: Poor sources."
        )
    )

    # Summary fields
    summary_md: str = Field(
        description="Concise markdown summary (2-3 paragraphs)"
    )
    summary_detailed_md: str = Field(
        description="Comprehensive markdown explanation for citizen understanding"
    )


class BaseResearchError(BaseModel):
    """Base model for research agent errors.

    Error codes follow a common pattern:
    - VAGUE_DESCRIPTION: Cannot identify the subject
    - NOT_FOUND: No reliable information found
    - MULTIPLE_MATCHES: Ambiguous, multiple items match
    - NOT_<DOMAIN>: Subject doesn't match expected type (e.g., NOT_REGULATION)
    """
    error: str = Field(
        description="Error code (VAGUE_DESCRIPTION, NOT_FOUND, MULTIPLE_MATCHES, or domain-specific)"
    )
    reason: str = Field(
        description="Human-readable explanation of the error"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Actionable suggestions for reformulating the query"
    )
