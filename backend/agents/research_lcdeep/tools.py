"""LangChain tools for research_lcdeep agent to access database functions."""

from typing import Optional, List
from langchain_core.tools import StructuredTool, BaseTool
from pydantic import BaseModel, Field
from agents.utils.db_tools import get_db_tools


# Module-level scrape tool holder (set by agent.py during initialization)
_scrape_tool: Optional[BaseTool] = None


def set_scrape_tool(tool: BaseTool):
    """Set the scrape tool for internal use by SaveSource."""
    global _scrape_tool
    _scrape_tool = tool


def get_scrape_tool() -> Optional[BaseTool]:
    """Get the scrape tool."""
    return _scrape_tool


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
    Evaluate and save a source. Internally scrapes the URL.

    Task ID automatically from context.
    """
    db_tools = get_db_tools()

    # Scrape the URL internally using BrightData MCP
    raw_content = None
    fetch_status = "failed"
    scrape_error = None

    scrape_tool = get_scrape_tool()
    if scrape_tool is not None:
        try:
            raw_content = await scrape_tool.ainvoke({"url": url})
            fetch_status = "completed"
        except Exception as e:
            scrape_error = str(e)
            fetch_status = "failed"
    else:
        scrape_error = "Scrape tool not initialized"

    # Save to database with scraped content
    source_id = await db_tools.save_source(
        url=url,
        title=title,
        relevance_score=relevance_score,
        reliability_score=reliability_score,
        evaluation_notes=evaluation_notes,
        researcher_id=researcher_id,
        raw_content=raw_content,
        fetch_status=fetch_status
    )

    if fetch_status == "completed":
        content_len = len(raw_content) if raw_content else 0
        return f"Saved and scraped source (ID: {source_id}, {content_len} chars)"
    else:
        return f"Saved source but scrape failed: {scrape_error} (ID: {source_id})"


async def load_research_data_impl() -> str:
    """Load all sources for a research task. Task ID automatically from context."""
    db_tools = get_db_tools()
    data = await db_tools.load_research_data()

    sources = data['sources']
    if not sources:
        return "No sources found for this research task."

    # Format sources with raw_content (truncated for display)
    output = f"## Research Sources ({len(sources)} total)\n\n"

    for source in sources:
        output += f"### {source['title']}\n"
        output += f"- **URL:** {source['url']}\n"
        output += f"- **Relevance:** {source['relevance_score']:.1f}\n"
        output += f"- **Reliability:** {source['reliability_score']:.1f}\n"
        output += f"- **Evaluator Notes:** {source['evaluation_notes']}\n"

        # Include raw content (truncated to avoid context overflow)
        raw_content = source.get('raw_content') or ''
        if raw_content:
            # Truncate to ~5000 chars per source
            if len(raw_content) > 5000:
                raw_content = raw_content[:5000] + "\n\n[... CONTENT TRUNCATED ...]"
            output += f"\n**Content:**\n{raw_content}\n"
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
