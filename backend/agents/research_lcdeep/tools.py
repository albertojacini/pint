"""LangChain tools for research_lcdeep agent to access database functions."""

from typing import Optional, List
from langchain_core.tools import StructuredTool, BaseTool
from pydantic import BaseModel, Field
from agents.utils.db_tools import get_db_tools
from agents.research_lcdeep.source_loader import SourceLoader


# Module-level source loader holder (set by agent.py during initialization)
_source_loader: Optional[SourceLoader] = None


def set_source_loader(loader: SourceLoader):
    """Set the source loader for use by SaveSource."""
    global _source_loader
    _source_loader = loader


def get_source_loader() -> Optional[SourceLoader]:
    """Get the source loader."""
    return _source_loader


# Pydantic schemas for tool inputs
class SaveSourceInput(BaseModel):
    url: str = Field(description="Source URL to evaluate and save")
    title: str = Field(description="Page title from search results")
    relevance_score: float = Field(
        ge=0.0,
        le=1.0,
        description="How relevant is this source to the research query (0.0-1.0)"
    )
    reliability_score: float = Field(
        ge=0.0,
        le=1.0,
        description="How reliable/credible is this source (0.0-1.0)"
    )
    evaluation_notes: str = Field(
        description="Brief notes explaining the relevance and reliability scores"
    )
    researcher_id: str = Field(
        default="EVALUATOR-1",
        description="Identifier of the evaluator"
    )


class LoadResearchDataInput(BaseModel):
    pass  # No parameters needed - task_id from context


class SaveSummaryInput(BaseModel):
    content: str = Field(description="Markdown summary content")
    summary_type: str = Field(
        default="final",
        description="Type of summary: 'overview', 'section', or 'final'"
    )
    parent_summary_id: Optional[str] = Field(
        default=None,
        description="UUID of parent summary (for hierarchical summaries)"
    )
    order: int = Field(
        default=0,
        description="Display order"
    )


class UpdateTaskStatusInput(BaseModel):
    task_id: str = Field(description="UUID of the research task")
    status: str = Field(description="New status: 'pending', 'researching', 'completed', or 'failed'")


# Tool implementation functions
async def save_source_impl(
    url: str,
    title: str,
    relevance_score: float,
    reliability_score: float,
    evaluation_notes: str,
    researcher_id: str = "EVALUATOR-1"
) -> str:
    """
    Evaluate and save a source. Internally fetches, validates, and summarizes the URL.

    Task ID automatically from context.
    """
    db_tools = get_db_tools()
    source_loader = get_source_loader()

    # Default values if loader not available
    raw_content = None
    source_summary = None
    source_type = "web"
    content_quality = "failed"
    fetch_status = "failed"
    error_msg = None

    if source_loader is not None:
        # Get research context for focused summarization
        research_context = await db_tools.get_research_context()
        if not research_context:
            research_context = "general research"

        # Use SourceLoader to fetch, validate, and summarize
        result = await source_loader.load(url, research_context)

        raw_content = result.raw_content
        source_summary = result.source_summary
        source_type = result.source_type
        content_quality = result.content_quality
        error_msg = result.error

        # Set fetch_status based on content_quality
        if content_quality == "good":
            fetch_status = "completed"
        elif content_quality == "partial":
            fetch_status = "completed"  # Still save, but quality is partial
        else:
            fetch_status = "failed"
    else:
        error_msg = "Source loader not initialized"

    # Save to database with all metadata
    source_id = await db_tools.save_source(
        url=url,
        title=title,
        relevance_score=relevance_score,
        reliability_score=reliability_score,
        evaluation_notes=evaluation_notes,
        researcher_id=researcher_id,
        raw_content=raw_content,
        source_summary=source_summary,
        source_type=source_type,
        content_quality=content_quality,
        fetch_status=fetch_status
    )

    # Build response message
    if content_quality == "good":
        summary_len = len(source_summary) if source_summary else 0
        return f"Saved source [{source_type}] with summary ({summary_len} chars) (ID: {source_id})"
    elif content_quality == "partial":
        return f"Saved source [{source_type}] with partial quality - no summary (ID: {source_id})"
    else:
        return f"Saved source but fetch failed: {error_msg} (ID: {source_id})"


async def load_research_data_impl() -> str:
    """Load all sources for a research task. Task ID automatically from context."""
    db_tools = get_db_tools()
    data = await db_tools.load_research_data()

    sources = data['sources']
    if not sources:
        return "No sources found for this research task."

    # Format sources with source_summary (preferred) or raw_content (fallback)
    output = f"## Research Sources ({len(sources)} total)\n\n"

    for source in sources:
        source_type = source.get('source_type') or 'web'
        content_quality = source.get('content_quality') or 'unknown'

        output += f"### {source['title']}\n"
        output += f"- **URL:** {source['url']}\n"
        output += f"- **Type:** {source_type}\n"
        output += f"- **Quality:** {content_quality}\n"
        output += f"- **Relevance:** {source['relevance_score']:.1f}\n"
        output += f"- **Reliability:** {source['reliability_score']:.1f}\n"
        output += f"- **Evaluator Notes:** {source['evaluation_notes']}\n"

        # Prefer source_summary over raw_content
        source_summary = source.get('source_summary')
        if source_summary:
            output += f"\n**Summary:**\n{source_summary}\n"
        else:
            # Fallback to raw_content (truncated)
            raw_content = source.get('raw_content') or ''
            if raw_content:
                if len(raw_content) > 3000:
                    raw_content = raw_content[:3000] + "\n\n[... CONTENT TRUNCATED ...]"
                output += f"\n**Content (no summary available):**\n{raw_content}\n"
            else:
                output += "\n**Content:** (not available)\n"

        output += "\n---\n\n"

    return output


async def save_summary_impl(
    content: str,
    summary_type: str = "final",
    parent_summary_id: Optional[str] = None,
    order: int = 0
) -> str:
    """Save a research summary to the database. Task ID automatically from context."""
    db_tools = get_db_tools()
    summary_id = await db_tools.save_summary(
        content, summary_type, parent_summary_id, order
    )
    return f"Saved summary with ID: {summary_id}"


async def update_task_status_impl(task_id: str, status: str) -> str:
    """Update the status of a research task."""
    db_tools = get_db_tools()
    await db_tools.update_task_status(task_id, status)
    return f"Updated task {task_id} to status: {status}"


# Create LangChain StructuredTools
def get_database_tools() -> List[StructuredTool]:
    """
    Get LangChain tools for database operations.

    Note: Does NOT include CreateResearchTask - tasks are created by the API layer
    before the agent runs.

    Returns:
        List of StructuredTool instances
    """
    return [
        StructuredTool.from_function(
            coroutine=save_source_impl,
            name="SaveSource",
            description="Evaluate and save a source with relevance/reliability scores. Automatically scrapes the URL.",
            args_schema=SaveSourceInput,
        ),
        StructuredTool.from_function(
            coroutine=load_research_data_impl,
            name="LoadResearchData",
            description="Load all research sources with their raw content from the database",
            args_schema=LoadResearchDataInput,
        ),
        StructuredTool.from_function(
            coroutine=save_summary_impl,
            name="SaveSummary",
            description="Save a synthesized research summary to the database",
            args_schema=SaveSummaryInput,
        ),
        StructuredTool.from_function(
            coroutine=update_task_status_impl,
            name="UpdateTaskStatus",
            description="Update the status of a research task to track progress",
            args_schema=UpdateTaskStatusInput,
        ),
    ]
