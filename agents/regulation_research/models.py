"""Data models for the regulation research agent."""

from enum import Enum
from pydantic import Field
from utils.models import BaseResearchOutput, BaseResearchError, ResearchStatus


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


class RegulationOutput(BaseResearchOutput):
    """Output regulation research object."""

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


class RegulationResearchError(BaseResearchError):
    """Error response when regulation cannot be researched."""
    pass


# Re-export for convenience
__all__ = [
    "ResearchStatus",
    "RegulationType",
    "Domain",
    "RegulationOutput",
    "RegulationResearchError",
]
