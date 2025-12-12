"""Data models for the provision generator agent."""

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class ProvisionType(str, Enum):
    """Types of provisions a political entity can control."""
    OWNERSHIP = "ownership"
    CONTRACT = "contract"
    REGULATION = "regulation"
    TAXATION = "taxation"
    ALLOCATION = "allocation"
    DESIGNATION = "designation"


class ProvisionStatus(str, Enum):
    """Status of a provision."""
    ACTIVE = "active"
    REPEALED = "repealed"
    SUSPENDED = "suspended"


# --- Input Models ---

class ProvisionGeneratorInput(BaseModel):
    """Input for the provision generator agent."""
    provision_description: str = Field(
        description="Short description of the provision to search for (e.g., 'Milan congestion charge')"
    )
    entity_name: str = Field(
        description="Name of the political entity (e.g., 'Comune di Milano', 'City of London')"
    )


# --- Extra Data Models (matching packages/types/src/index.ts) ---

class OwnershipExtraData(BaseModel):
    """Extra data for ownership provisions."""
    type: str = "ownership"

    # Asset classification
    assetCategory: str | None = Field(
        None,
        description="One of: equity, real_estate, intellectual_property, infrastructure, other"
    )
    assetName: str | None = None

    # Ownership details
    ownershipPercentage: float | None = Field(None, ge=0, le=100)
    purpose: str | None = Field(
        None,
        description="One of: public_service, strategic_infrastructure, economic_development, revenue_generation"
    )

    # Acquisition (what they paid)
    investmentAmount: float | None = None
    investmentCurrency: str | None = None
    acquisitionDate: str | None = Field(None, description="YYYY-MM-DD format")

    # Current value (what it's worth)
    valuationAmount: float | None = None
    valuationCurrency: str | None = None
    valuationDate: str | None = Field(None, description="YYYY-MM-DD format")

    # Annual financial impact
    annualCashFlow: float | None = Field(None, description="Positive = revenue, Negative = cost/subsidy")
    annualCashFlowCurrency: str | None = None
    annualCashFlowYear: str | None = Field(None, description="Fiscal year YYYY")


class ContractExtraData(BaseModel):
    """Extra data for contract provisions."""
    type: str = "contract"
    contractType: str | None = Field(
        None,
        description="One of: service, concession, partnership"
    )


class RegulationExtraData(BaseModel):
    """Extra data for regulation provisions."""
    type: str = "regulation"

    regulationType: str | None = Field(
        None,
        description="One of: ordinance, code, standard, permit_system, restriction, requirement, other"
    )
    domain: str | None = Field(
        None,
        description="One of: housing, land_use, environment, commerce, transport, public_space, health_safety, labor, other"
    )
    complexity: int | None = Field(None, ge=0, le=10, description="0 = trivial, 10 = extremely complex")

    # Summary fields
    summary_md: str | None = Field(None, description="Markdown summary of the regulation")
    summary_detailed_md: str | None = Field(None, description="Detailed markdown summary")


class TaxationExtraData(BaseModel):
    """Extra data for taxation provisions."""
    type: str = "taxation"

    taxType: str | None = Field(None, description="One of: tax, fee, tariff")
    rateDescription: str | None = Field(None, description="Human-readable rate information")

    # Annual financial data
    taxRevenueFiscalYear: str | None = Field(None, description="YYYY")
    taxRevenueAmount: float | None = None

    # Collection costs
    collectionCostAmount: float | None = None
    collectionCostYear: str | None = Field(None, description="YYYY")

    # Growth & trends
    revenueGrowth: float | None = Field(None, description="YoY % change")
    revenueGrowthPreviousYear: str | None = Field(None, description="YYYY")

    # Fiscal importance
    taxRevenueShare: float | None = Field(None, ge=0, le=100)

    # Tax design
    progressivity: str | None = Field(
        None,
        description="One of: regressive, proportional, progressive, mixed"
    )


class AllocationExtraData(BaseModel):
    """Extra data for allocation provisions."""
    type: str = "allocation"


class DesignationExtraData(BaseModel):
    """Extra data for designation provisions."""
    type: str = "designation"


# --- Output Models ---

class ProvisionOutput(BaseModel):
    """Output provision object matching the schema in packages/types/src/index.ts."""

    # Entity reference (will be set by caller or looked up)
    entityId: str = Field(description="UUID of the political entity")

    # Basic provision fields
    title: str = Field(description="Clear, concise name (e.g., 'Area C Access Fee')")
    description: str | None = Field(None, description="What it is and what the entity can do with it")
    type: ProvisionType
    status: ProvisionStatus = ProvisionStatus.ACTIVE

    # Temporal validity
    effectiveFrom: str | None = Field(None, description="Start date in YYYY-MM-DD format")
    effectiveUntil: str | None = Field(None, description="End date in YYYY-MM-DD format")

    # Relationships
    ideaId: str | None = Field(None, description="UUID of related idea")

    # Type-specific data
    extraData: dict[str, Any] | None = Field(
        None,
        description="Type-specific data matching the discriminated union schema"
    )

    # Research metadata (not part of the provision schema, for debugging)
    sourceUrls: list[str] = Field(default_factory=list, description="URLs used as sources")
    confidence: float | None = Field(None, ge=0, le=1, description="Confidence score 0-1")


class ProvisionGeneratorError(BaseModel):
    """Error response when provision cannot be generated."""
    error: str
    reason: str
    suggestions: list[str] = Field(default_factory=list)
