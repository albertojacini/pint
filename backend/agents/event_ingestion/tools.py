"""LangChain tools for event ingestion agent."""

from typing import Optional, List
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from agents.utils.ei_db_tools import get_ei_db_tools


# ============================================================================
# Pydantic schemas for tool inputs
# ============================================================================

class UpdateSourceInput(BaseModel):
    source_id: str = Field(description="UUID of the source to update")
    ai_summary: Optional[str] = Field(default=None, description="AI-generated summary of the source content")
    ai_extracted_data: Optional[dict] = Field(
        default=None,
        description="Extracted data: {topics: [], entitiesMentioned: [], datesMentioned: [], eventTypeHints: [], peopleMentioned: []}"
    )
    processing_status: Optional[str] = Field(
        default=None,
        description="New processing status: 'processed' or 'discarded'"
    )


class GetSourceInput(BaseModel):
    source_id: str = Field(description="UUID of the source to retrieve")


class CreateCandidateInput(BaseModel):
    title: str = Field(description="Event title")
    description: Optional[str] = Field(default=None, description="Event description")
    event_type: str = Field(
        description="Event type: legislative_session, bill_proposal, referendum, executive_order, regulation_update, court_ruling, budget_approval, service_change, project_launch, etc."
    )
    occurred_at: str = Field(description="When the event occurred (ISO 8601 date string, e.g., '2024-01-15')")
    detected_entity_id: Optional[str] = Field(default=None, description="UUID of the detected political entity")
    confidence_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence in this event (0.0-1.0)")
    ai_reasoning: Optional[str] = Field(default=None, description="Reasoning for why this is a valid event")
    source_ids: List[str] = Field(description="List of source UUIDs that support this event")


class SearchEntitiesInput(BaseModel):
    search_term: Optional[str] = Field(default=None, description="Search term to find entities by name")


class SearchProvisionsInput(BaseModel):
    entity_id: Optional[str] = Field(default=None, description="Filter provisions by entity UUID")
    search_term: Optional[str] = Field(default=None, description="Search term to find provisions by title/description")


class CreateCandidateChangeInput(BaseModel):
    candidate_id: str = Field(description="UUID of the candidate this change belongs to")
    target_type: str = Field(description="Type of target: 'provision', 'entity', or 'administration'")
    target_id: Optional[str] = Field(default=None, description="UUID of the existing target (null if creating new)")
    action: str = Field(description="Action type: 'create', 'update', or 'delete'")
    proposed_data: dict = Field(description="Data to apply to the target (e.g., {title: ..., displayChanges: ...})")
    description: str = Field(description="Human-readable description of what this change does")
    effective_at: Optional[str] = Field(default=None, description="When this change takes effect (ISO 8601 date)")


# ============================================================================
# Tool implementations
# ============================================================================

async def get_source_impl(source_id: str) -> str:
    """Get a source by ID."""
    db_tools = get_ei_db_tools()
    source = await db_tools.get_source(source_id)

    if not source:
        return f"Source not found: {source_id}"

    # Format for agent consumption
    output = f"## Source: {source.get('title', 'Untitled')}\n\n"
    output += f"- **ID:** {source['id']}\n"
    output += f"- **URL:** {source.get('url', 'N/A')}\n"
    output += f"- **Type:** {source.get('source_type', 'unknown')}\n"
    output += f"- **Source Name:** {source.get('source_name', 'N/A')}\n"
    output += f"- **Published:** {source.get('published_at', 'N/A')}\n"
    output += f"- **Processing Status:** {source.get('processing_status', 'unknown')}\n"

    if source.get('raw_content'):
        content = source['raw_content']
        if len(content) > 5000:
            content = content[:5000] + "\n\n[... TRUNCATED ...]"
        output += f"\n### Content:\n{content}\n"

    if source.get('ai_summary'):
        output += f"\n### AI Summary:\n{source['ai_summary']}\n"

    if source.get('ai_extracted_data'):
        output += f"\n### Extracted Data:\n{source['ai_extracted_data']}\n"

    return output


async def update_source_impl(
    source_id: str,
    ai_summary: Optional[str] = None,
    ai_extracted_data: Optional[dict] = None,
    processing_status: Optional[str] = None
) -> str:
    """Update a source with AI-generated data."""
    db_tools = get_ei_db_tools()

    update_fields = {}
    if ai_summary is not None:
        update_fields['ai_summary'] = ai_summary
    if ai_extracted_data is not None:
        update_fields['ai_extracted_data'] = ai_extracted_data
    if processing_status is not None:
        update_fields['processing_status'] = processing_status

    if not update_fields:
        return "No fields to update"

    await db_tools.update_source(source_id, **update_fields)
    return f"Updated source {source_id}: {list(update_fields.keys())}"


async def create_candidate_impl(
    title: str,
    event_type: str,
    occurred_at: str,
    source_ids: List[str],
    description: Optional[str] = None,
    detected_entity_id: Optional[str] = None,
    confidence_score: Optional[float] = None,
    ai_reasoning: Optional[str] = None
) -> str:
    """Create a new event candidate from sources."""
    db_tools = get_ei_db_tools()
    from datetime import datetime

    # Parse date
    try:
        occurred_dt = datetime.fromisoformat(occurred_at.replace('Z', '+00:00'))
    except ValueError:
        # Try just date
        occurred_dt = datetime.strptime(occurred_at, '%Y-%m-%d')

    candidate_id = await db_tools.create_candidate(
        title=title,
        description=description,
        event_type=event_type,
        occurred_at=occurred_dt,
        detected_entity_id=detected_entity_id,
        confidence_score=confidence_score,
        ai_reasoning=ai_reasoning,
        source_ids=source_ids
    )

    return f"Created candidate {candidate_id} with {len(source_ids)} source(s)"


async def search_entities_impl(search_term: Optional[str] = None) -> str:
    """Search for political entities."""
    db_tools = get_ei_db_tools()
    entities = await db_tools.search_entities(search_term=search_term)

    if not entities:
        return "No entities found"

    output = f"## Found {len(entities)} entities:\n\n"
    for e in entities:
        output += f"- **{e['name']}** ({e['type']}) - ID: {e['id']}\n"

    return output


async def search_provisions_impl(
    entity_id: Optional[str] = None,
    search_term: Optional[str] = None
) -> str:
    """Search for provisions."""
    db_tools = get_ei_db_tools()
    provisions = await db_tools.search_provisions(
        entity_id=entity_id,
        search_term=search_term
    )

    if not provisions:
        return "No provisions found"

    output = f"## Found {len(provisions)} provisions:\n\n"
    for p in provisions:
        desc = p.get('description_short') or 'No description'
        output += f"- **{p['title']}** - {desc}\n  ID: {p['id']}\n"

    return output


async def create_candidate_change_impl(
    candidate_id: str,
    target_type: str,
    action: str,
    proposed_data: dict,
    description: str,
    target_id: Optional[str] = None,
    effective_at: Optional[str] = None
) -> str:
    """Create a proposed change for a candidate."""
    db_tools = get_ei_db_tools()
    from datetime import datetime

    effective_dt = None
    if effective_at:
        try:
            effective_dt = datetime.fromisoformat(effective_at.replace('Z', '+00:00'))
        except ValueError:
            effective_dt = datetime.strptime(effective_at, '%Y-%m-%d')

    change_id = await db_tools.create_candidate_change(
        candidate_id=candidate_id,
        target_type=target_type,
        target_id=target_id,
        action=action,
        proposed_data=proposed_data,
        description=description,
        effective_at=effective_dt
    )

    return f"Created change {change_id} for candidate {candidate_id}"


# ============================================================================
# Tool exports
# ============================================================================

def get_source_processor_tools() -> List[StructuredTool]:
    """Get tools for the source processor agent."""
    return [
        StructuredTool.from_function(
            coroutine=get_source_impl,
            name="GetSource",
            description="Get a source by ID to read its content",
            args_schema=GetSourceInput,
        ),
        StructuredTool.from_function(
            coroutine=update_source_impl,
            name="UpdateSource",
            description="Update a source with AI summary and extracted data",
            args_schema=UpdateSourceInput,
        ),
    ]


def get_candidate_generator_tools() -> List[StructuredTool]:
    """Get tools for the candidate generator agent."""
    return [
        StructuredTool.from_function(
            coroutine=get_source_impl,
            name="GetSource",
            description="Get a source by ID to read its content and AI analysis",
            args_schema=GetSourceInput,
        ),
        StructuredTool.from_function(
            coroutine=search_entities_impl,
            name="SearchEntities",
            description="Search for political entities by name",
            args_schema=SearchEntitiesInput,
        ),
        StructuredTool.from_function(
            coroutine=search_provisions_impl,
            name="SearchProvisions",
            description="Search for provisions by entity and/or text",
            args_schema=SearchProvisionsInput,
        ),
        StructuredTool.from_function(
            coroutine=create_candidate_impl,
            name="CreateCandidate",
            description="Create a new event candidate from one or more sources",
            args_schema=CreateCandidateInput,
        ),
        StructuredTool.from_function(
            coroutine=create_candidate_change_impl,
            name="CreateCandidateChange",
            description="Create a proposed change that the event will cause to a provision, entity, or administration",
            args_schema=CreateCandidateChangeInput,
        ),
    ]
