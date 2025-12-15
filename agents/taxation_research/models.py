"""Data models for the taxation research agent."""

from enum import Enum
from pydantic import Field
from utils.models import BaseResearchOutput, BaseResearchError, ResearchStatus


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


class TaxationOutput(BaseResearchOutput):
    """Output tax policy research object."""

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


class TaxationResearchError(BaseResearchError):
    """Error response when tax policy cannot be researched."""
    pass


# Re-export for convenience
__all__ = [
    "ResearchStatus",
    "TaxType",
    "Progressivity",
    "TaxationOutput",
    "TaxationResearchError",
]
