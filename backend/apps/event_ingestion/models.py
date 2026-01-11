"""Pydantic models for event ingestion API."""

from typing import List, Optional
from pydantic import BaseModel


class FetchSourceResponse(BaseModel):
    status: str
    source_id: Optional[str] = None
    content_length: Optional[int] = None
    error: Optional[str] = None


class ProcessSourceResponse(BaseModel):
    status: str
    source_id: Optional[str] = None
    error: Optional[str] = None


class GenerateCandidateRequest(BaseModel):
    source_ids: List[str]


class GenerateCandidateResponse(BaseModel):
    status: str
    candidate_id: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None


class SourceStatusResponse(BaseModel):
    id: str
    title: Optional[str]
    url: Optional[str]
    fetch_status: str
    processing_status: str
    ai_summary: Optional[str] = None
    ai_extracted_data: Optional[dict] = None
    promoted_document_id: Optional[str] = None


class CandidateStatusResponse(BaseModel):
    id: str
    title: Optional[str]
    status: str
    event_type: Optional[str]
    detected_entity_name: Optional[str]
    documents: Optional[List[dict]] = None
    changes: Optional[List[dict]] = None
