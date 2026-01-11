"""Pydantic models for the sources app."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class PublisherBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[HttpUrl] = None
    feed_url: Optional[HttpUrl] = None
    publisher_type: str  # official, news, academic, social, open_data, gazette
    language: Optional[str] = None  # BCP 47 tag
    reliability_score: Optional[float] = None  # 0-10
    update_frequency: Optional[str] = None  # realtime, daily, weekly, monthly
    access_method: Optional[str] = None  # rss, api, scrape, manual
    is_active: bool = True
    coverage: Optional[dict] = None  # topics, entity_ids covered
    metadata: Optional[dict] = None


class PublisherCreate(PublisherBase):
    pass


class Publisher(PublisherBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    publisher_id: Optional[UUID] = None
    url: Optional[HttpUrl] = None
    title: Optional[str] = None
    document_type: str  # article, pdf, post, gazette_issue, press_release, minutes
    language: Optional[str] = None
    published_at: Optional[datetime] = None
    raw_content: Optional[str] = None
    content_hash: Optional[str] = None  # For deduplication
    summary: Optional[str] = None
    extracted_data: Optional[dict] = None  # AI-extracted: entities, dates, topics
    metadata: Optional[dict] = None


class DocumentCreate(DocumentBase):
    pass


class Document(DocumentBase):
    id: UUID
    fetch_status: str
    processing_status: str
    fetched_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
