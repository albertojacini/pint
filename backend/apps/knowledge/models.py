"""Pydantic models for the knowledge app."""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


class ArtifactType(str, Enum):
    """Artifact types - each should pass the "printability test":
    Would this data make a meaningful table or diagram in a report?
    """
    EVOLUTION = "evolution"        # Time series → line/area chart
    DISTRIBUTION = "distribution"  # Categorical breakdown → bar/pie chart
    TABLE = "table"                # Multi-dimensional data → data table
    PARAMETERS = "parameters"      # Config/rules/thresholds → structured table
    NARRATIVE = "narrative"        # Qualitative summary → text block


class ArtifactState(str, Enum):
    """Tracks completeness of artifact data."""
    DRAFT = "draft"        # Extracted but needs validation
    PARTIAL = "partial"    # Has meaningful content but known gaps
    COMPLETE = "complete"  # Fully populated with available data
    STALE = "stale"        # May be outdated, needs refresh


class ArtifactBase(BaseModel):
    title: str
    description: Optional[str] = None
    artifact_type: ArtifactType
    content: Optional[str] = None
    state: ArtifactState = ArtifactState.DRAFT
    state_notes: Optional[str] = None


class ArtifactCreate(ArtifactBase):
    pass


class Artifact(ArtifactBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArtifactSourceCreate(BaseModel):
    artifact_id: UUID
    document_id: UUID


class ArtifactSource(ArtifactSourceCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ProvisionArtifactCreate(BaseModel):
    provision_id: UUID
    artifact_id: UUID


class ProvisionArtifact(ProvisionArtifactCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
