"""Data models for the avatar generation agent."""

from enum import Enum
from pydantic import BaseModel, Field


class AvatarSource(str, Enum):
    """Source of the avatar image."""
    DOWNLOADED = "downloaded"    # Found and downloaded from web
    GENERATED = "generated"      # Generated with DALL-E 3


class AvatarOutput(BaseModel):
    """Output avatar generation object."""

    # Basic info
    entity_name: str = Field(
        description="Name of the entity the avatar represents"
    )

    # Image details
    image_path: str = Field(
        description="Absolute path to the generated 512x512 PNG avatar"
    )
    source: AvatarSource = Field(
        description="Whether the avatar was downloaded or generated"
    )

    # Source metadata (if downloaded)
    source_url: str | None = Field(
        None,
        description="Original URL where the image was found (null if generated)"
    )
    source_page: str | None = Field(
        None,
        description="Webpage where the image was discovered (null if generated)"
    )

    # Quality metrics
    validation_score: float = Field(
        ge=0,
        le=1,
        description="Quality score from validation (0-1, higher is better)"
    )
    validation_notes: list[str] = Field(
        default_factory=list,
        description="Notes about why this image was selected"
    )

    # Generation metadata (if generated)
    dalle_prompt: str | None = Field(
        None,
        description="Prompt used for DALL-E generation (null if downloaded)"
    )

    # Processing info
    candidates_evaluated: int = Field(
        description="Number of candidate images evaluated before selection"
    )


class AvatarGenerationError(BaseModel):
    """Error response when avatar cannot be generated."""

    error: str = Field(
        description="Error code: NO_IMAGES_FOUND, ALL_REJECTED, DALLE_FAILED, DOWNLOAD_FAILED"
    )
    reason: str = Field(
        description="Human-readable explanation of the error"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Suggestions for resolving the issue"
    )
    attempted_sources: list[str] = Field(
        default_factory=list,
        description="URLs or methods attempted before failure"
    )


__all__ = [
    "AvatarSource",
    "AvatarOutput",
    "AvatarGenerationError",
]
