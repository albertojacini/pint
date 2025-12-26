"""Response models for the API."""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel


class TaskStatus(str, Enum):
    PENDING = "pending"
    RESEARCHING = "researching"
    COMPLETED = "completed"
    FAILED = "failed"


class ResearchResponse(BaseModel):
    task_id: str


class ResearchResultResponse(BaseModel):
    task_id: str
    status: TaskStatus
    query: str
    entity_id: Optional[str] = None
    sources_count: int
    findings_count: int
    summary: Optional[str] = None
    subtopics: List[str] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ReviseResponse(BaseModel):
    task_id: str
    original_task_id: str
