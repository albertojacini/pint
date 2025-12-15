"""Data models for the ownership research domain."""

from enum import Enum
from pydantic import BaseModel, Field


class OwnershipStatus(str, Enum):
    """Current status of the ownership.

    - active: Currently held by the public entity
    - divested: Sold or transferred
    - suspended: Under review or temporarily frozen
    """
    ACTIVE = "active"
    DIVESTED = "divested"
    SUSPENDED = "suspended"


class AssetCategory(str, Enum):
    """Category of the public asset."""
    EQUITY = "equity"                         # Shares in companies
    REAL_ESTATE = "real_estate"               # Land, buildings
    INTELLECTUAL_PROPERTY = "intellectual_property"  # Patents, trademarks
    INFRASTRUCTURE = "infrastructure"         # Roads, utilities, networks
    OTHER = "other"


class OwnershipPurpose(str, Enum):
    """Strategic purpose of the public ownership."""
    PUBLIC_SERVICE = "public_service"                 # Essential service delivery
    STRATEGIC_INFRASTRUCTURE = "strategic_infrastructure"  # National/local importance
    ECONOMIC_DEVELOPMENT = "economic_development"     # Job creation, industry support
    REVENUE_GENERATION = "revenue_generation"         # Financial returns


# --- Output Model ---

class OwnershipOutput(BaseModel):
    """Output public asset research object."""

    # Basic identification
    title: str = Field(
        description=(
            "Name of the public holding/asset in its original language. "
            "Should be the commonly used name, clear and recognizable."
        )
    )
    description: str = Field(
        description=(
            "Explanation of what the asset is and why it's publicly owned. "
            "2-3 sentences covering the key aspects."
        )
    )
    status: OwnershipStatus = Field(
        description="Current status of the ownership"
    )

    # Temporal validity
    effectiveFrom: str | None = Field(
        None,
        description="When the ownership was acquired (YYYY-MM-DD format)"
    )
    effectiveUntil: str | None = Field(
        None,
        description="When the ownership ended (YYYY-MM-DD format, null if still held)"
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
            "0.9-1.0: Official government/company sources. "
            "0.7-0.8: Good sources, some gaps. "
            "0.5-0.6: Mixed sources. "
            "<0.5: Poor sources."
        )
    )

    # Asset classification
    assetCategory: AssetCategory = Field(
        description="Category of the public asset"
    )
    assetName: str | None = Field(
        None,
        description="Specific name of the asset if different from title (e.g., company name for equity)"
    )

    # Ownership details
    ownershipPercentage: float | None = Field(
        None,
        ge=0,
        le=100,
        description="Percentage of ownership held (0-100, null if full ownership)"
    )
    purpose: OwnershipPurpose | None = Field(
        None,
        description="Strategic purpose of the public ownership"
    )

    # Acquisition details (what they paid)
    investmentAmount: float | None = Field(
        None,
        description="Original acquisition cost/investment amount"
    )
    investmentCurrency: str | None = Field(
        None,
        description="Currency of the investment amount (ISO 4217 code, e.g., EUR, USD)"
    )
    acquisitionDate: str | None = Field(
        None,
        description="Date of acquisition (YYYY-MM-DD format)"
    )

    # Current valuation (what it's worth)
    valuationAmount: float | None = Field(
        None,
        description="Current estimated value of the holding"
    )
    valuationCurrency: str | None = Field(
        None,
        description="Currency of the valuation (ISO 4217 code)"
    )
    valuationDate: str | None = Field(
        None,
        description="Date of the valuation (YYYY-MM-DD format)"
    )

    # Annual financial impact
    annualCashFlow: float | None = Field(
        None,
        description="Annual cash flow (positive = revenue/dividend, negative = subsidy/cost)"
    )
    annualCashFlowCurrency: str | None = Field(
        None,
        description="Currency of the cash flow (ISO 4217 code)"
    )
    annualCashFlowYear: str | None = Field(
        None,
        description="Fiscal year for the cash flow data (YYYY format)"
    )

    # Summary fields
    summary_md: str = Field(
        description=(
            "Concise markdown summary (2-3 paragraphs): what the asset is, "
            "why it's publicly owned, and its financial significance."
        )
    )
    summary_detailed_md: str = Field(
        description=(
            "Comprehensive markdown explanation: full history, strategic importance, "
            "governance structure, financial performance, public benefit, "
            "and any controversies or debates about the ownership."
        )
    )


class OwnershipResearchError(BaseModel):
    """Error response when public asset cannot be researched."""
    error: str = Field(
        description=(
            "Error code: "
            "VAGUE_DESCRIPTION (cannot identify asset), "
            "NOT_PUBLIC_ASSET (not a public holding), "
            "NOT_FOUND (no reliable information), "
            "MULTIPLE_MATCHES (ambiguous, multiple assets match)"
        )
    )
    reason: str = Field(
        description="Human-readable explanation of the error"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Actionable suggestions for reformulating the query"
    )
