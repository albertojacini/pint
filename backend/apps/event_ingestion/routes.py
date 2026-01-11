"""Event ingestion API endpoints.

WORKFLOW: Multi-step event ingestion pipeline
----------------------------------------------------------------------
Step 1: Add source (handled by frontend via server action)
  - Source created in ing_sources table

Step 2: Fetch source content
  POST /event-ingestion/sources/{source_id}/fetch
  - Fetches URL content and stores in raw_content
  - Updates fetch_status to 'fetched'

Step 3: Process source with AI
  POST /event-ingestion/sources/{source_id}/process
  - AI analyzes content, generates summary and extractions
  - Promotes source to sou_documents
  - Updates processing_status to 'processed'
  - Runs in background, poll for completion

Step 4: Generate candidate from sources
  POST /event-ingestion/candidates/generate
  - AI creates event candidate from one or more sources
  - Links candidate to sou_documents (not raw sources)
  - AI proposes changes to affected provisions
  - Runs in background, poll for completion

Step 5: Review and approve (handled by frontend)
  - User reviews candidate, edits as needed
  - Approves to create actual event + changes
"""

from typing import List
from fastapi import APIRouter, HTTPException, BackgroundTasks

from apps.event_ingestion.models import (
    FetchSourceResponse,
    ProcessSourceResponse,
    GenerateCandidateRequest,
    GenerateCandidateResponse,
    SourceStatusResponse,
    CandidateStatusResponse,
)
from apps.event_ingestion.services import get_event_ingestion_service

router = APIRouter(prefix="/event-ingestion")


# ============================================================================
# Background task runners
# ============================================================================

async def run_process_source(source_id: str):
    """Background task to process a source."""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    logger.info(f"Starting source processing for: {source_id}")
    try:
        service = get_event_ingestion_service()
        result = await service.process_source(source_id)
        logger.info(f"Source processing result: {result}")
    except Exception as e:
        logger.error(f"Source processing failed: {e}", exc_info=True)


async def run_generate_candidate(source_ids: List[str]):
    """Background task to generate a candidate."""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    logger.info(f"Starting candidate generation for sources: {source_ids}")
    try:
        service = get_event_ingestion_service()
        result = await service.generate_candidate(source_ids)
        logger.info(f"Candidate generation result: {result}")
    except Exception as e:
        logger.error(f"Candidate generation failed: {e}", exc_info=True)


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/sources/{source_id}/fetch", response_model=FetchSourceResponse)
async def fetch_source(source_id: str) -> FetchSourceResponse:
    """
    Fetch content from a source URL.

    Downloads the URL content and stores it in the source's raw_content field.
    """
    service = get_event_ingestion_service()
    result = await service.fetch_source_content(source_id)
    return FetchSourceResponse(**result)


@router.post("/sources/{source_id}/process", response_model=ProcessSourceResponse)
async def process_source(
    source_id: str,
    background_tasks: BackgroundTasks
) -> ProcessSourceResponse:
    """
    Process a source with AI.

    Analyzes the source content and extracts:
    - AI summary
    - Topics, entities, dates, event type hints, people mentioned

    After processing, promotes the source to sou_documents.

    Runs in background. Poll GET /sources/{source_id}/status for completion.
    """
    service = get_event_ingestion_service()

    # Verify source exists and is fetched
    source = await service.get_source(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    if source.get('fetch_status') != 'fetched':
        raise HTTPException(
            status_code=400,
            detail=f"Source must be fetched first. Current status: {source.get('fetch_status')}"
        )

    # Start processing in background
    background_tasks.add_task(run_process_source, source_id)

    return ProcessSourceResponse(status="processing", source_id=source_id)


@router.get("/sources/{source_id}/status", response_model=SourceStatusResponse)
async def get_source_status(source_id: str) -> SourceStatusResponse:
    """
    Get the current status of a source.

    Use this to poll for processing completion.
    """
    service = get_event_ingestion_service()
    source = await service.get_source(source_id)

    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    return SourceStatusResponse(
        id=str(source['id']),
        title=source.get('title'),
        url=source.get('url'),
        fetch_status=source.get('fetch_status', 'pending'),
        processing_status=source.get('processing_status', 'unprocessed'),
        ai_summary=source.get('ai_summary'),
        ai_extracted_data=source.get('ai_extracted_data'),
        promoted_document_id=source.get('promoted_document_id')
    )


@router.post("/candidates/generate", response_model=GenerateCandidateResponse)
async def generate_candidate(
    request: GenerateCandidateRequest,
    background_tasks: BackgroundTasks
) -> GenerateCandidateResponse:
    """
    Generate an event candidate from one or more sources.

    The AI will:
    1. Analyze the sources to understand the event
    2. Find the relevant political entity
    3. Search for affected provisions
    4. Create the candidate linked to sou_documents

    Runs in background. The candidate will appear in the candidates list.
    """
    service = get_event_ingestion_service()

    if not request.source_ids:
        raise HTTPException(status_code=400, detail="No source IDs provided")

    # Verify all sources exist and are processed
    for source_id in request.source_ids:
        source = await service.get_source(source_id)
        if not source:
            raise HTTPException(status_code=404, detail=f"Source not found: {source_id}")
        if source.get('processing_status') != 'processed':
            raise HTTPException(
                status_code=400,
                detail=f"Source {source_id} must be processed first"
            )

    # Start generation in background
    background_tasks.add_task(run_generate_candidate, request.source_ids)

    return GenerateCandidateResponse(
        status="generating",
        message=f"Generating candidate from {len(request.source_ids)} source(s)"
    )


@router.get("/candidates/{candidate_id}/status", response_model=CandidateStatusResponse)
async def get_candidate_status(candidate_id: str) -> CandidateStatusResponse:
    """
    Get the current status of a candidate.
    """
    service = get_event_ingestion_service()
    candidate = await service.get_candidate(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return CandidateStatusResponse(
        id=str(candidate['id']),
        title=candidate.get('title'),
        status=candidate.get('status', 'pending'),
        event_type=candidate.get('event_type'),
        detected_entity_name=candidate.get('detected_entity_name'),
        documents=candidate.get('documents'),
        changes=candidate.get('changes')
    )
