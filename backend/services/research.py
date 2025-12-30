"""Research service supporting both research_claude and research_lcdeep agents."""

from typing import Optional, Dict, Any, Literal

from agents.utils.db_tools import get_db_tools
from agents.research_claude.agent import run as run_research_claude
from agents.research_lcdeep.agent import run as run_research_lcdeep


async def create_research_task(
    query: str,
    entity_id: Optional[str] = None,
    entity_name: Optional[str] = None,
    agent_type: Literal["claude", "lcdeep"] = "claude"
) -> tuple[str, Literal["claude", "lcdeep"]]:
    """
    Create a new research task in the database.

    Args:
        query: The research question/description
        entity_id: Optional UUID of the entity being researched
        entity_name: Optional name of the entity (appended to query for context)
        agent_type: Which agent to use - "claude" (Claude SDK) or "lcdeep" (LangChain Deep Agents)

    Returns:
        tuple of (task_id, agent_type)
    """
    db = get_db_tools()
    await db.connect()

    # Append entity name to query for context if provided
    full_query = query
    if entity_name:
        full_query = f"{query} ({entity_name})"

    task_id = await db.create_research_task(
        input_text=full_query
    )
    return task_id, agent_type


async def run_research_job(task_id: str, agent_type: Literal["claude", "lcdeep"] = "claude"):
    """
    Run research agent for a task. Designed to be run as a background task.

    Args:
        task_id: UUID of the research task
        agent_type: Which agent to use - "claude" or "lcdeep"
    """
    if agent_type == "lcdeep":
        await run_research_lcdeep(task_id)
    else:
        await run_research_claude(task_id)


async def get_task_status(task_id: str) -> Optional[Dict[str, Any]]:
    """
    Get the status and results of a research task.

    Args:
        task_id: UUID of the research task

    Returns:
        Task status and results dict, or None if not found
    """
    db = get_db_tools()
    await db.connect()
    return await db.get_task_results(task_id)
