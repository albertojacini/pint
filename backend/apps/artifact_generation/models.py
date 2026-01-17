"""Pydantic models for artifact generation."""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from apps.knowledge.models import ArtifactType, ArtifactState


class ProvisionContext(BaseModel):
    """Provision data needed for artifact generation."""

    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    description_short: Optional[str] = None
    summary_md: Optional[str] = None
    entity_id: UUID
    entity_name: str
    provision_types: list[str] = []


class ChunkResult(BaseModel):
    """Result from semantic search."""

    chunk_id: str
    document_id: str
    document_title: str
    document_url: Optional[str] = None
    publisher_name: Optional[str] = None
    reliability_score: Optional[float] = None
    chunk_index: int
    content: str
    similarity: float
    metadata: dict = {}


class ArtifactPlan(BaseModel):
    """Plan for extracting a single artifact."""

    title: str
    artifact_type: ArtifactType
    description: str
    relevant_chunk_indices: list[int]
    expected_state: ArtifactState = ArtifactState.DRAFT
    state_notes: Optional[str] = None


class ExtractedArtifact(BaseModel):
    """Artifact content extracted from chunks."""

    title: str
    description: str
    artifact_type: ArtifactType
    content: str
    source_document_ids: list[str]
    state: ArtifactState = ArtifactState.DRAFT
    state_notes: Optional[str] = None
