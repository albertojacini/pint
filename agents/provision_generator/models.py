"""Data models for the provision generator agent."""

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class ProvisionType(str, Enum):
    """Types of provisions a political entity can control.

    Each type represents a different control mechanism:
    - ownership: Stakes in companies, property, infrastructure the entity can sell/buy/divest
    - contract: Service agreements, concessions the entity can renegotiate/terminate
    - regulation: Rules, ordinances, codes the entity can amend/repeal/tighten
    - taxation: Taxes, fees, tariffs the entity can raise/lower/restructure
    - allocation: Programs, subsidies, budgets the entity can increase/cut/redirect
    - designation: Zones, landmarks, protected areas the entity can expand/shrink/reclassify
    """
    OWNERSHIP = "ownership"
    CONTRACT = "contract"
    REGULATION = "regulation"
    TAXATION = "taxation"
    ALLOCATION = "allocation"
    DESIGNATION = "designation"


class ProvisionStatus(str, Enum):
    """Current legal/operational status of a provision.

    - active: Currently in force and enforceable
    - repealed: Officially abolished, no longer valid
    - suspended: Temporarily inactive but not permanently repealed
    """
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
        description=(
            "Category of owned asset. Options: "
            "equity (company shares/stakes), "
            "real_estate (buildings, land, property), "
            "intellectual_property (patents, trademarks, copyrights), "
            "infrastructure (utilities, networks, public facilities), "
            "other (assets not fitting above categories)"
        )
    )
    assetName: str | None = Field(
        None,
        description="Specific name of the asset (e.g., 'ATM S.p.A.', 'Palazzo Marino', 'Milan Metro Network')"
    )

    # Ownership details
    ownershipPercentage: float | None = Field(
        None,
        ge=0,
        le=100,
        description="Percentage stake owned by the entity (0-100%). Use 100 for full ownership."
    )
    purpose: str | None = Field(
        None,
        description=(
            "Primary purpose of ownership. Options: "
            "public_service (providing essential services to citizens), "
            "strategic_infrastructure (maintaining control of critical systems), "
            "economic_development (stimulating local economy/jobs), "
            "revenue_generation (generating income for entity budget)"
        )
    )

    # Acquisition (what they paid)
    investmentAmount: float | None = Field(
        None,
        description="Original acquisition cost paid by the entity (at time of purchase/investment)"
    )
    investmentCurrency: str | None = Field(None, description="Currency code for investment amount (e.g., EUR, USD)")
    acquisitionDate: str | None = Field(None, description="Date of acquisition in YYYY-MM-DD format")

    # Current value (what it's worth)
    valuationAmount: float | None = Field(
        None,
        description="Current market or book value of the asset (most recent valuation available)"
    )
    valuationCurrency: str | None = Field(None, description="Currency code for valuation amount (e.g., EUR, USD)")
    valuationDate: str | None = Field(None, description="Date of valuation in YYYY-MM-DD format")

    # Annual financial impact
    annualCashFlow: float | None = Field(
        None,
        description=(
            "Net annual financial impact on entity budget: "
            "positive values indicate revenue-generating assets (dividends, rent, profits), "
            "negative values indicate cost-bearing/subsidized assets (operating losses, subsidies required)"
        )
    )
    annualCashFlowCurrency: str | None = Field(None, description="Currency code for cash flow (e.g., EUR, USD)")
    annualCashFlowYear: str | None = Field(None, description="Fiscal year for cash flow figure (YYYY format)")


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
    complexity: int | None = Field(
        None,
        ge=0,
        le=10,
        description=(
            "Complexity level for affected parties to understand and comply with this regulation. "
            "Scale: 0 = simple rule anyone can follow without guidance, "
            "5 = requires some expertise or professional planning, "
            "10 = extremely complex requiring specialized legal/technical professionals"
        )
    )

    # Summary fields
    summary_md: str | None = Field(
        None,
        description=(
            "Concise markdown summary of what the regulation requires or prohibits (2-3 paragraphs). "
            "Should cover: what is regulated, key requirements/restrictions, who is affected."
        )
    )
    summary_detailed_md: str | None = Field(
        None,
        description=(
            "Comprehensive markdown explanation of the regulation suitable for citizen understanding. "
            "Should include: full scope, specific requirements, exceptions and exemptions, "
            "enforcement mechanisms, penalties, and how to comply."
        )
    )


class TaxationExtraData(BaseModel):
    """Extra data for taxation provisions."""
    type: str = "taxation"

    taxType: str | None = Field(None, description="One of: tax, fee, tariff")
    rateDescription: str | None = Field(
        None,
        description=(
            "Human-readable description of tax rate structure, including rates, tiers, and conditions. "
            "Example: '5 EUR per vehicle entry, 10 EUR for high-emission vehicles (Euro 0-3), "
            "exemptions for residents and electric vehicles'"
        )
    )

    # Annual financial data
    taxRevenueFiscalYear: str | None = Field(
        None,
        description="Fiscal year for which revenue data applies (YYYY format)"
    )
    taxRevenueAmount: float | None = Field(
        None,
        description="Total annual revenue collected from this tax in the specified fiscal year"
    )

    # Collection costs
    collectionCostAmount: float | None = Field(
        None,
        description="Annual administrative and operational costs for collecting this tax (enforcement, systems, personnel)"
    )
    collectionCostYear: str | None = Field(None, description="Fiscal year for collection cost data (YYYY format)")

    # Growth & trends
    revenueGrowth: float | None = Field(
        None,
        description="Year-over-year percentage change in tax revenue compared to previous year (can be negative for declining revenue)"
    )
    revenueGrowthPreviousYear: str | None = Field(
        None,
        description="Previous fiscal year used for calculating revenue growth (YYYY format)"
    )

    # Fiscal importance
    taxRevenueShare: float | None = Field(
        None,
        ge=0,
        le=100,
        description="This tax as percentage of total entity revenue (0-100%). Indicates relative fiscal importance."
    )

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
    title: str = Field(
        description=(
            "Clear, citizen-recognizable name without bureaucratic jargon or reference codes. "
            "Good: 'Area C Congestion Charge', 'Municipal Housing Stock', 'Building Permit Regulation'. "
            "Bad: 'DC 2011/45 Art. 3', 'Law 234/2020', 'Regulation XYZ'"
        )
    )
    description: str | None = Field(
        None,
        description=(
            "Explanation of what this provision IS and what control actions the entity CAN TAKE with it. "
            "Examples: 'can raise/lower rates', 'can sell/buy more shares', 'can amend/repeal rules', "
            "'can terminate/renegotiate contract'. Focus on the control relationship, not just description."
        )
    )
    type: ProvisionType
    status: ProvisionStatus = ProvisionStatus.ACTIVE

    # Temporal validity
    effectiveFrom: str | None = Field(None, description="Start date in YYYY-MM-DD format")
    effectiveUntil: str | None = Field(None, description="End date in YYYY-MM-DD format")

    # Relationships
    ideaId: str | None = Field(
        None,
        description=(
            "UUID linking to a policy idea or political initiative that created, motivated, or proposed this provision. "
            "Set to null if not linked to any specific idea or initiative."
        )
    )

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
    error: str = Field(
        description=(
            "Error code identifying the issue: "
            "VAGUE_DESCRIPTION (cannot determine provision type), "
            "NOT_A_PROVISION (doesn't meet provision criteria), "
            "WRONG_JURISDICTION (entity lacks control), "
            "NOT_FOUND (no reliable information found), "
            "TOO_ABSTRACT (wrong granularity level)"
        )
    )
    reason: str = Field(
        description="Human-readable explanation of why the provision could not be generated and what went wrong"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Actionable suggestions for how to reformulate the query or what additional information to provide"
    )
