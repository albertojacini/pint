"""LangChain tools for research_lcdeep agent to access database functions."""

from typing import Optional, List, Dict, Any
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from agents.research_claude.utils.db_tools import get_db_tools


# Pydantic schemas for tool inputs
class CreateResearchTaskInput(BaseModel):
    query: str = Field(description="The research question or topic")
    subtopics: List[str] = Field(description="List of 2-4 research subtopics to explore")


class SaveSourceInput(BaseModel):
    task_id: str = Field(description="UUID of the research task")
    url: str = Field(description="Source URL from search results")
    title: str = Field(description="Page title")
    content: str = Field(description="Relevant excerpt from the source")
    researcher_id: str = Field(description="Identifier of the researcher (e.g., 'RESEARCHER-1')")


class SaveFindingInput(BaseModel):
    task_id: str = Field(description="UUID of the research task")
    source_id: str = Field(description="UUID of the source this finding came from")
    content: str = Field(description="The finding/fact/claim")
    confidence: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0-1.0)"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Extra structured data"
    )


class LoadResearchDataInput(BaseModel):
    task_id: str = Field(description="UUID of the research task")


class SaveSummaryInput(BaseModel):
    task_id: str = Field(description="UUID of the research task")
    content: str = Field(description="Markdown summary content")
    summary_type: str = Field(
        default="final",
        description="Type of summary: 'overview', 'section', or 'final'"
    )
    finding_ids: Optional[List[str]] = Field(
        default=None,
        description="List of finding UUIDs to link"
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
async def create_research_task_impl(query: str, subtopics: List[str]) -> str:
    """Create a new research task in the database."""
    db_tools = get_db_tools()
    task_id = await db_tools.create_research_task(query, subtopics)
    return f"Created research task with ID: {task_id}"


async def save_source_impl(
    task_id: str,
    url: str,
    title: str,
    content: str,
    researcher_id: str
) -> str:
    """Save a web source to the database."""
    db_tools = get_db_tools()
    source_id = await db_tools.save_source(task_id, url, title, content, researcher_id)
    return f"Saved source with ID: {source_id}"


async def save_finding_impl(
    task_id: str,
    source_id: str,
    content: str,
    confidence: float = 0.8,
    metadata: Optional[Dict[str, Any]] = None
) -> str:
    """Save a research finding to the database."""
    db_tools = get_db_tools()
    finding_id = await db_tools.save_finding(
        task_id, source_id, content, confidence, metadata
    )
    return f"Saved finding with ID: {finding_id}"


async def load_research_data_impl(task_id: str) -> str:
    """Load all sources and findings for a research task."""
    db_tools = get_db_tools()
    data = await db_tools.load_research_data(task_id)

    # Format sources
    sources_text = f"## Sources ({len(data['sources'])} total)\n\n"
    for source in data['sources']:
        sources_text += f"**{source['title']}**\n"
        sources_text += f"- URL: {source['url']}\n"
        sources_text += f"- Researcher: {source['researcher_id']}\n"
        sources_text += f"- Content: {source['content'][:200]}...\n\n"

    # Format findings
    findings_text = f"## Findings ({len(data['findings'])} total)\n\n"
    for finding in data['findings']:
        findings_text += f"- {finding['content']}\n"
        findings_text += f"  Source: {finding['source_url']}\n"
        findings_text += f"  Confidence: {finding['confidence']}\n\n"

    return sources_text + "\n" + findings_text


async def save_summary_impl(
    task_id: str,
    content: str,
    summary_type: str = "final",
    finding_ids: Optional[List[str]] = None,
    parent_summary_id: Optional[str] = None,
    order: int = 0
) -> str:
    """Save a research summary to the database."""
    db_tools = get_db_tools()
    summary_id = await db_tools.save_summary(
        task_id, content, summary_type, finding_ids, parent_summary_id, order
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

    Returns:
        List of StructuredTool instances
    """
    return [
        StructuredTool.from_function(
            coroutine=create_research_task_impl,
            name="CreateResearchTask",
            description="Create a new research task in the database to track research progress",
            args_schema=CreateResearchTaskInput,
        ),
        StructuredTool.from_function(
            coroutine=save_source_impl,
            name="SaveSource",
            description="Save a web source discovered during research to the database",
            args_schema=SaveSourceInput,
        ),
        StructuredTool.from_function(
            coroutine=save_finding_impl,
            name="SaveFinding",
            description="Save a specific research finding/fact extracted from a source",
            args_schema=SaveFindingInput,
        ),
        StructuredTool.from_function(
            coroutine=load_research_data_impl,
            name="LoadResearchData",
            description="Load all research sources and findings from the database for a task",
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
