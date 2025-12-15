"""Data models for the regulation research agent."""

from enum import Enum
from pydantic import BaseModel, Field


class RegulationStatus(str, Enum):
    """Current legal status of regulation.

    - active: Currently in force and enforceable
    - repealed: Officially abolished, no longer valid
    - suspended: Temporarily inactive but not permanently repealed
    """
    ACTIVE = "active"
    REPEALED = "repealed"
    SUSPENDED = "suspended"


class RegulationType(str, Enum):
    """Type of regulation/legislation."""
    ORDINANCE = "ordinance"
    CODE = "code"
    STANDARD = "standard"
    PERMIT_SYSTEM = "permit_system"
    RESTRICTION = "restriction"
    REQUIREMENT = "requirement"
    OTHER = "other"


class Domain(str, Enum):
    """Domain/sector that the regulation governs."""
    HOUSING = "housing"
    LAND_USE = "land_use"
    ENVIRONMENT = "environment"
    COMMERCE = "commerce"
    TRANSPORT = "transport"
    PUBLIC_SPACE = "public_space"
    HEALTH_SAFETY = "health_safety"
    LABOR = "labor"
    OTHER = "other"


# --- Output Model ---

class RegulationOutput(BaseModel):
    """Output regulation research object."""

    # Basic fields
    title: str = Field(
        description=(
            "Official name of the regulation in its original language. "
            "Should be clear and recognizable without bureaucratic jargon."
        )
    )
    description: str = Field(
        description=(
            "Explanation of what the regulation governs and its main purpose. "
            "2-3 sentences covering the key aspects."
        )
    )
    status: RegulationStatus = Field(
        description="Current legal status of the regulation"
    )

    # Temporal validity
    effectiveFrom: str | None = Field(
        None,
        description="When the regulation took effect (YYYY-MM-DD format)"
    )
    effectiveUntil: str | None = Field(
        None,
        description="When the regulation ended/will end (YYYY-MM-DD format, null if still active)"
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

    # Regulation-specific fields
    regulationType: RegulationType = Field(
        description="Type of regulation (ordinance, code, standard, etc.)"
    )
    domain: Domain = Field(
        description="Domain/sector regulated (housing, transport, environment, etc.)"
    )
    complexity: int = Field(
        ge=0,
        le=10,
        description=(
            "Complexity level (0-10) for affected parties to understand and comply. "
            "0 = simple rule. 5 = requires expertise. 10 = extremely complex."
        )
    )

    # Summary fields
    summary_md: str = Field(
        description=(
            "Concise markdown summary (2-3 paragraphs): what is regulated, "
            "key requirements/restrictions, who is affected."
        )
    )
    summary_detailed_md: str = Field(
        description=(
            "Comprehensive markdown explanation for citizen understanding: "
            "full scope, specific requirements, exceptions, exemptions, "
            "enforcement mechanisms, penalties, how to comply."
        )
    )


class RegulationResearchError(BaseModel):
    """Error response when regulation cannot be researched."""
    error: str = Field(
        description=(
            "Error code: "
            "VAGUE_DESCRIPTION (cannot identify regulation), "
            "NOT_REGULATION (not a law/regulation), "
            "NOT_FOUND (no reliable information), "
            "MULTIPLE_MATCHES (ambiguous, multiple regulations match)"
        )
    )
    reason: str = Field(
        description="Human-readable explanation of the error"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Actionable suggestions for reformulating the query"
    )
