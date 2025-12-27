"""Provision workflow endpoints."""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from services.provision import get_provision_service
from services.research import run_research_job

router = APIRouter(prefix="/provision")


# Request models
class GeneratePromptRequest(BaseModel):
    input_description: str
    entity_name: str


class StartResearchRequest(BaseModel):
    research_prompt: str
    entity_id: Optional[str] = None
    entity_name: Optional[str] = None


class GenerateDraftRequest(BaseModel):
    research_summary: str
    entity_name: str
    input_description: str


# Response models
class GeneratePromptResponse(BaseModel):
    research_prompt: str
    reasoning: str


class StartResearchResponse(BaseModel):
    task_id: str


class GenerateDraftResponse(BaseModel):
    title: str
    description_short: str
    description: str
    summary_md: str
    provision_type: str
    relevance: int
    confidence: float
    source_urls: List[str]


@router.post("/generate-prompt", response_model=GeneratePromptResponse)
async def generate_research_prompt(request: GeneratePromptRequest) -> GeneratePromptResponse:
    """
    Transform user's research topic into a detailed research prompt.

    Step 2 of workflow: inline LLM call to expand topic.
    """
    service = get_provision_service()
    result = await service.generate_research_prompt(
        input_description=request.input_description,
        entity_name=request.entity_name,
    )
    return GeneratePromptResponse(**result)


@router.post("/start-research", response_model=StartResearchResponse)
async def start_research(
    request: StartResearchRequest,
    background_tasks: BackgroundTasks,
) -> StartResearchResponse:
    """
    Start research agent with approved prompt.

    Step 3 of workflow: kicks off research agent.
    Returns immediately with task_id. Poll /provision/research-status/{task_id} for results.
    """
    service = get_provision_service()
    task_id = await service.start_research(
        research_prompt=request.research_prompt,
        entity_id=request.entity_id,
        entity_name=request.entity_name,
    )

    # Run research in background
    background_tasks.add_task(run_research_job, task_id)

    return StartResearchResponse(task_id=task_id)


@router.get("/research-status/{task_id}")
async def get_research_status(task_id: str):
    """
    Poll research status.

    Returns research results when complete.
    """
    service = get_provision_service()
    result = await service.get_research_results(task_id)

    if not result:
        raise HTTPException(status_code=404, detail="Task not found")

    return result


@router.post("/generate-draft", response_model=GenerateDraftResponse)
async def generate_provision_draft(request: GenerateDraftRequest) -> GenerateDraftResponse:
    """
    Generate provision draft from research summary.

    Step 5 of workflow: inline LLM call to structure draft.
    LLM determines provision type automatically.
    """
    service = get_provision_service()
    result = await service.generate_provision_draft(
        research_summary=request.research_summary,
        entity_name=request.entity_name,
        input_description=request.input_description,
    )
    return GenerateDraftResponse(**result)
