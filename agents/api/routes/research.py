"""Research and jobs endpoints."""

import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks

from api.models import (
    ResearchRequest,
    ResearchResponse,
    JobStatusResponse,
    JobStatus,
    ReviseRequest,
    ReviseResponse,
)
from api.services.job_manager import job_manager, JobStatus as JobStatusEnum
from api.services.research import run_research_job

router = APIRouter()


@router.post("/research", response_model=ResearchResponse)
async def start_research(
    request: ResearchRequest,
    background_tasks: BackgroundTasks,
) -> ResearchResponse:
    """
    Start a research job for a provision.

    Returns immediately with a job_id. Poll /jobs/{job_id} for status.
    """
    job = job_manager.create_job(
        description=request.description,
        provision_type=request.provision_type.value,
        entity_name=request.entity_name,
        agent=request.agent,
    )

    # Run the research job in the background
    background_tasks.add_task(run_research_job, job.id)

    return ResearchResponse(job_id=job.id)


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str) -> JobStatusResponse:
    """
    Get the status of a research job.

    Poll this endpoint to check if the job is complete.
    """
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(
        job_id=job.id,
        status=JobStatus(job.status.value),
        result=job.result,
        error=job.error,
    )


@router.post("/revise", response_model=ReviseResponse)
async def revise_result(
    request: ReviseRequest,
    background_tasks: BackgroundTasks,
) -> ReviseResponse:
    """
    Ask the agent to revise a completed result based on feedback.

    Creates a new job with the feedback incorporated.
    """
    original_job = job_manager.get_job(request.job_id)

    if not original_job:
        raise HTTPException(status_code=404, detail="Original job not found")

    if original_job.status != JobStatusEnum.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Can only revise completed jobs"
        )

    # Create new job with feedback incorporated into description
    revised_description = f"{original_job.description}\n\nUser feedback: {request.feedback}"

    new_job = job_manager.create_job(
        description=revised_description,
        provision_type=original_job.provision_type,
        entity_name=original_job.entity_name,
        agent=original_job.agent,  # Preserve agent from original job
    )

    # Run the research job in the background
    background_tasks.add_task(run_research_job, new_job.id)

    return ReviseResponse(job_id=new_job.id)
