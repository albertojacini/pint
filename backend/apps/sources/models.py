"""Pydantic models for the sources app."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


# ============================================================================
# Publisher Models
# ============================================================================


class PublisherBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[HttpUrl] = None
    publisher_type: str  # administration, news, academia, organization, other
    reliability_tier: str = "unverified"  # official, verified, unverified
    reliability_score: float = 0.5  # 0.0-1.0
    is_active: bool = True
    metadata: Optional[dict] = None


class PublisherCreate(PublisherBase):
    pass


class Publisher(PublisherBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PublisherResponse(BaseModel):
    """Publisher with document count for list endpoint."""
    id: str
    name: str
    publisher_type: str
    reliability_tier: str
    reliability_score: float
    document_count: int = 0


# ============================================================================
# Document Models
# ============================================================================


class DocumentBase(BaseModel):
    publisher_id: Optional[UUID] = None
    url: Optional[HttpUrl] = None
    title: Optional[str] = None
    document_type: str = "pdf"  # pdf, html, other
    document_category: Optional[str] = None  # budget, regulation, contract, report, minutes, announcement, other
    administrative_level: Optional[str] = None  # municipal, regional, national, eu, other
    fiscal_year: Optional[int] = None
    classification_method: Optional[str] = None  # manual, auto, llm
    language: Optional[str] = None
    published_at: Optional[datetime] = None
    raw_content: Optional[str] = None
    content_hash: Optional[str] = None
    summary: Optional[str] = None
    metadata: Optional[dict] = None


class DocumentCreate(DocumentBase):
    pass


class Document(DocumentBase):
    id: UUID
    fetch_status: str = "pending"
    processing_status: str = "unprocessed"
    embedding_status: str = "pending"
    chunk_count: int = 0
    file_path: Optional[str] = None
    fetched_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    """Document with publisher info for GET endpoint."""
    id: str
    title: Optional[str] = None
    publisher: Optional[dict] = None
    document_category: Optional[str] = None
    administrative_level: Optional[str] = None
    fiscal_year: Optional[int] = None
    embedding_status: str
    chunk_count: int
    created_at: datetime


# ============================================================================
# Document Chunks (for semantic search)
# ============================================================================


class DocumentChunk(BaseModel):
    """A chunk of document content with embedding."""
    id: UUID
    document_id: UUID
    chunk_index: int
    content: str
    content_tokens: Optional[int] = None
    metadata: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Search Models
# ============================================================================


class SearchFilters(BaseModel):
    """Filters for semantic search."""
    publisher_id: Optional[str] = None
    document_category: Optional[str] = None
    administrative_level: Optional[str] = None
    min_reliability: Optional[float] = None


class SearchResult(BaseModel):
    """A single search result with publisher info."""
    chunk_id: str
    document_id: str
    document_title: Optional[str] = None
    document_url: Optional[str] = None
    publisher_name: Optional[str] = None
    reliability_score: Optional[float] = None
    chunk_index: int
    content: str
    similarity: float
    metadata: Optional[dict] = None


class SearchRequest(BaseModel):
    """Semantic search request with optional filters."""
    query: str
    limit: int = 10
    threshold: float = 0.5
    filters: Optional[SearchFilters] = None


class SearchResponse(BaseModel):
    """Semantic search response."""
    query: str
    results: list[SearchResult]
    total: int


# ============================================================================
# Chat Models (RAG)
# ============================================================================


class ChatRequest(BaseModel):
    """RAG chat request."""
    query: str
    document_ids: Optional[list[str]] = None
    filters: Optional[SearchFilters] = None
    include_sources: bool = True


class ChatResponse(BaseModel):
    """RAG chat response."""
    answer: str
    sources: list[SearchResult]


# ============================================================================
# Upload / Ingest Models
# ============================================================================


class IngestURLRequest(BaseModel):
    """Request to ingest a webpage by URL."""
    url: HttpUrl
    publisher_id: Optional[str] = None
    title: Optional[str] = None
    document_category: Optional[str] = None
    administrative_level: Optional[str] = None
    fiscal_year: Optional[int] = None


class UploadDocumentResponse(BaseModel):
    """Response after document upload and processing."""
    document_id: str
    title: str
    publisher_id: Optional[str] = None
    document_category: Optional[str] = None
    administrative_level: Optional[str] = None
    fiscal_year: Optional[int] = None
    chunk_count: int
    status: str
