"""Request and response models for the API."""

from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel


class ProvisionType(str, Enum):
    OWNERSHIP = "ownership"
    CONTRACT = "contract"
    REGULATION = "regulation"
    TAXATION = "taxation"
    ALLOCATION = "allocation"
    DESIGNATION = "designation"


class ClassifyRequest(BaseModel):
    description: str
    entity_name: str


class ClassifyResponse(BaseModel):
    suggested_type: ProvisionType
    confidence: float
    reasoning: str


class ResearchRequest(BaseModel):
    description: str
    provision_type: ProvisionType
    entity_name: str


class ResearchResponse(BaseModel):
    job_id: str


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None


class ReviseRequest(BaseModel):
    job_id: str
    feedback: str


class ReviseResponse(BaseModel):
    job_id: str
