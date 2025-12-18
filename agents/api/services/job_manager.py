"""In-memory job management for async research tasks."""

import uuid
from datetime import datetime
from typing import Optional, Any
from dataclasses import dataclass, field
from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Job:
    id: str
    status: JobStatus
    description: str
    provision_type: str
    entity_name: str
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


class JobManager:
    """Simple in-memory job manager."""

    def __init__(self):
        self._jobs: dict[str, Job] = {}

    def create_job(self, description: str, provision_type: str, entity_name: str) -> Job:
        """Create a new pending job."""
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id,
            status=JobStatus.PENDING,
            description=description,
            provision_type=provision_type,
            entity_name=entity_name,
        )
        self._jobs[job_id] = job
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID."""
        return self._jobs.get(job_id)

    def update_job_status(self, job_id: str, status: JobStatus) -> None:
        """Update job status."""
        if job_id in self._jobs:
            self._jobs[job_id].status = status
            self._jobs[job_id].updated_at = datetime.now()

    def set_job_result(self, job_id: str, result: dict[str, Any]) -> None:
        """Set job result and mark as completed."""
        if job_id in self._jobs:
            self._jobs[job_id].result = result
            self._jobs[job_id].status = JobStatus.COMPLETED
            self._jobs[job_id].updated_at = datetime.now()

    def set_job_error(self, job_id: str, error: str) -> None:
        """Set job error and mark as failed."""
        if job_id in self._jobs:
            self._jobs[job_id].error = error
            self._jobs[job_id].status = JobStatus.FAILED
            self._jobs[job_id].updated_at = datetime.now()


# Global job manager instance
job_manager = JobManager()
