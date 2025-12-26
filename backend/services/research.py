"""Research service using the unified research_agent."""

from typing import Optional, Dict, Any

from agents.research.utils.db_tools import get_db_tools
from agents.research.agent import run as run_research_agent


async def create_research_task(
    query: str,
    entity_id: Optional[str] = None,
    entity_name: Optional[str] = None
) -> str:
    """
    Create a new research task in the database.

    Args:
        query: The research question/description
        entity_id: Optional UUID of the entity being researched
        entity_name: Optional name of the entity (appended to query for context)

    Returns:
        task_id: UUID of the created task
    """
    db = get_db_tools()
    await db.connect()

    # Append entity name to query for context if provided
    full_query = query
    if entity_name:
        full_query = f"{query} ({entity_name})"

    task_id = await db.create_research_task(
        query=full_query,
        subtopics=[],
        entity_id=entity_id
    )
    return task_id


async def run_research_job(task_id: str):
    """
    Run research agent for a task. Designed to be run as a background task.

    Args:
        task_id: UUID of the research task
    """
    await run_research_agent(task_id)


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
