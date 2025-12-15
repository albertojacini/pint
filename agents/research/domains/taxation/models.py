"""Data models for the taxation research domain."""

from enum import Enum
from pydantic import BaseModel, Field


class TaxStatus(str, Enum):
    """Current status of the tax/fee.

    - active: Currently being collected
    - repealed: No longer in effect
    - suspended: Temporarily not collected
    """
    ACTIVE = "active"
    REPEALED = "repealed"
    SUSPENDED = "suspended"


class TaxType(str, Enum):
    """Type of fiscal instrument."""
    TAX = "tax"
    FEE = "fee"
    TARIFF = "tariff"


class Progressivity(str, Enum):
    """Tax progressivity classification."""
    REGRESSIVE = "regressive"      # Lower earners pay higher % of income
    PROPORTIONAL = "proportional"  # Flat rate for all
    PROGRESSIVE = "progressive"    # Higher earners pay higher %
    MIXED = "mixed"                # Combination or tiered structure


# --- Output Model ---

class TaxationOutput(BaseModel):
    """Output tax policy research object."""

    # Basic identification
    title: str = Field(
        description=(
            "Official name of the tax/fee in its original language. "
            "Should be the commonly used name, clear and recognizable."
        )
    )
    description: str = Field(
        description=(
            "Explanation of what is taxed and the purpose of the tax. "
            "2-3 sentences covering the key aspects."
        )
    )
    status: TaxStatus = Field(
        description="Current status of the tax/fee"
    )

    # Temporal validity
    effectiveFrom: str | None = Field(
        None,
        description="When the tax was introduced (YYYY-MM-DD format)"
    )
    effectiveUntil: str | None = Field(
        None,
        description="When the tax ended/will end (YYYY-MM-DD format, null if still active)"
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
            "0.9-1.0: Official government sources. "
            "0.7-0.8: Good sources, some gaps. "
            "0.5-0.6: Mixed sources. "
            "<0.5: Poor sources."
        )
    )

    # Tax classification
    taxType: TaxType = Field(
        description="Type of fiscal instrument (tax, fee, or tariff)"
    )

    # Rate information
    rateDescription: str | None = Field(
        None,
        description=(
            "Human-readable description of the tax rate structure. "
            "E.g., '2% of property value', '€5 per night', 'Progressive 15-43%'"
        )
    )

    # Revenue data
    taxRevenueFiscalYear: str | None = Field(
        None,
        description="Fiscal year for revenue data (YYYY format)"
    )
    taxRevenueAmount: float | None = Field(
        None,
        description="Annual tax revenue in local currency"
    )

    # Collection costs
    collectionCostAmount: float | None = Field(
        None,
        description="Annual cost to administer/collect the tax in local currency"
    )
    collectionCostYear: str | None = Field(
        None,
        description="Year for collection cost data (YYYY format)"
    )

    # Growth trends
    revenueGrowth: float | None = Field(
        None,
        description="Year-over-year revenue growth percentage (e.g., 5.2 for 5.2%)"
    )
    revenueGrowthPreviousYear: str | None = Field(
        None,
        description="The year used as baseline for growth calculation (YYYY format)"
    )

    # Fiscal importance
    taxRevenueShare: float | None = Field(
        None,
        ge=0,
        le=100,
        description="Percentage of total government revenue from this tax (0-100)"
    )

    # Tax design
    progressivity: Progressivity | None = Field(
        None,
        description="Tax progressivity classification"
    )

    # Summary fields
    summary_md: str = Field(
        description=(
            "Concise markdown summary (2-3 paragraphs): what is taxed, "
            "who pays, the rate structure, and revenue significance."
        )
    )
    summary_detailed_md: str = Field(
        description=(
            "Comprehensive markdown explanation for citizen understanding: "
            "full scope, rate calculation examples, exemptions, "
            "payment procedures, deadlines, penalties for non-compliance."
        )
    )


class TaxationResearchError(BaseModel):
    """Error response when tax policy cannot be researched."""
    error: str = Field(
        description=(
            "Error code: "
            "VAGUE_DESCRIPTION (cannot identify tax), "
            "NOT_TAX (not a tax/fee/tariff), "
            "NOT_FOUND (no reliable information), "
            "MULTIPLE_MATCHES (ambiguous, multiple taxes match)"
        )
    )
    reason: str = Field(
        description="Human-readable explanation of the error"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Actionable suggestions for reformulating the query"
    )
