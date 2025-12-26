"""Research endpoints."""

from fastapi import APIRouter, HTTPException, BackgroundTasks

from api.models import (
    ResearchRequest,
    ResearchResponse,
    ResearchResultResponse,
    ReviseRequest,
    ReviseResponse,
)
from services.research import (
    create_research_task,
    run_research_job,
    get_task_status,
)

router = APIRouter()


@router.post("/research", response_model=ResearchResponse)
async def start_research(
    request: ResearchRequest,
    background_tasks: BackgroundTasks,
) -> ResearchResponse:
    """
    Start a research job.

    Returns immediately with a task_id. Poll /research/{task_id} for status.
    """
    task_id = await create_research_task(
        query=request.description,
        entity_id=request.entity_id,
        entity_name=request.entity_name,
    )

    # Run the research job in the background
    background_tasks.add_task(run_research_job, task_id)

    return ResearchResponse(task_id=task_id)


@router.get("/research/{task_id}", response_model=ResearchResultResponse)
async def get_research_status(task_id: str) -> ResearchResultResponse:
    """
    Get the status of a research task.

    Poll this endpoint to check if the task is complete.
    Returns full results including summary when completed.
    """
    result = await get_task_status(task_id)

    if not result:
        raise HTTPException(status_code=404, detail="Task not found")

    return ResearchResultResponse(**result)


@router.post("/research/{task_id}/revise", response_model=ReviseResponse)
async def revise_research(
    task_id: str,
    request: ReviseRequest,
    background_tasks: BackgroundTasks,
) -> ReviseResponse:
    """
    Re-run research with user feedback incorporated.

    Creates a new task with the feedback appended to the original query.
    """
    original = await get_task_status(task_id)

    if not original:
        raise HTTPException(status_code=404, detail="Original task not found")

    # Create new query with feedback
    new_query = f"{original['query']}\n\nUser feedback: {request.feedback}"

    new_task_id = await create_research_task(
        query=new_query,
        entity_id=original.get("entity_id"),
    )

    # Run the research job in the background
    background_tasks.add_task(run_research_job, new_task_id)

    return ReviseResponse(task_id=new_task_id, original_task_id=task_id)
