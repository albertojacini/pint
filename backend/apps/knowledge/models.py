"""Pydantic models for the knowledge app."""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


class ArtifactType(str, Enum):
    TIME_SERIES = "time_series"
    BREAKDOWN = "breakdown"
    PARAMETERS = "parameters"
    NARRATIVE = "narrative"
    DATASET = "dataset"
    METRIC = "metric"


class ArtifactBase(BaseModel):
    title: str
    description: Optional[str] = None
    artifact_type: ArtifactType
    content: Optional[str] = None


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
