"""Database models for provisions domain.

These models match the database schema defined in supabase/migrations/20251104143356_provisions.sql
They are the source of truth for data structures - other modules should extend these.
"""

from pydantic import BaseModel, Field, field_validator


class ProvisionDraftOutput(BaseModel):
    """Output model for provision draft generation from LLM.

    This model represents the structured output from generate_provision_draft()
    and maps to fields in the provision_drafts table.
    """

    title: str = Field(
        description="Official name of the provision (clear, concise)"
    )

    description_short: str = Field(
        max_length=100,
        description="One-sentence summary (STRICT LIMIT: exactly 100 characters or less)"
    )

    description: str = Field(
        max_length=1000,
        description="Detailed description explaining what this provision is"
    )

    summary_md: str = Field(
        max_length=20000,
        description="Full markdown summary with sections: Overview, Key Details, History, Current Status"
    )

    provision_type_codes: list[str] = Field(
        description=(
            "Array of provision type codes that apply to this provision. "
            "Valid codes: ownership, contract, regulation, taxation, allocation, designation. "
            "Can contain multiple types simultaneously."
        )
    )

    relevance: int = Field(
        ge=0,
        le=10,
        description=(
            "Relevance/importance score (0-10) indicating how significant this provision is to the entity. "
            "Consider: financial impact, citizens affected, political significance."
        )
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Confidence score (0.0-1.0) in the accuracy of information. "
            "Based on source quality and completeness."
        )
    )

    source_urls: list[str] = Field(
        default_factory=list,
        description="List of source URLs used for research"
    )

    @field_validator('description_short')
    @classmethod
    def validate_description_short_length(cls, v: str) -> str:
        """Enforce strict 100 character limit for description_short."""
        if len(v) > 100:
            raise ValueError(f"description_short must be <= 100 characters, got {len(v)}")
        return v

    @field_validator('provision_type_codes')
    @classmethod
    def validate_provision_type_codes(cls, v: list[str]) -> list[str]:
        """Ensure provision type codes are valid."""
        valid_codes = {'ownership', 'contract', 'regulation', 'taxation', 'allocation', 'designation'}
        invalid_codes = set(v) - valid_codes
        if invalid_codes:
            raise ValueError(f"Invalid provision type codes: {invalid_codes}")
        if not v:
            raise ValueError("At least one provision type code is required")
        return v

