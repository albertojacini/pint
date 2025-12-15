"""Data models for the ownership research agent."""

from enum import Enum
from pydantic import Field
from utils.models import BaseResearchOutput, BaseResearchError, ResearchStatus


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


class OwnershipOutput(BaseResearchOutput):
    """Output public asset research object."""

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


class OwnershipResearchError(BaseResearchError):
    """Error response when public asset cannot be researched."""
    pass


# Re-export for convenience
__all__ = [
    "ResearchStatus",
    "AssetCategory",
    "OwnershipPurpose",
    "OwnershipOutput",
    "OwnershipResearchError",
]
