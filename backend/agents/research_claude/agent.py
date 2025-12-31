"""DEPRECATED: Claude SDK research agent (deprecated in favor of research_lcdeep).

This agent is deprecated and will be removed in a future version.
Use research_lcdeep instead, which provides the same functionality with BrightData integration.

This module now serves only as a gateway for backward compatibility,
delegating all work to research_lcdeep.
"""

import warnings


async def run(task_id: str) -> str:
    """
    DEPRECATED: Run research for an existing task.

    This function now delegates to research_lcdeep for backward compatibility.

    Args:
        task_id: UUID of an existing research task in the database

    Returns:
        task_id when complete

    Raises:
        DeprecationWarning: This agent is deprecated
    """
    warnings.warn(
        "research_claude is deprecated and will be removed in a future version. "
        "Use research_lcdeep instead by updating backend/services/research_config.py",
        DeprecationWarning,
        stacklevel=2
    )

    # Delegate to research_lcdeep
    from agents.research_lcdeep.agent import run as run_lcdeep
    return await run_lcdeep(task_id)


async def chat(initial_query: str = None):
    """
    DEPRECATED: Interactive chat mode.

    This function is deprecated and no longer implemented.
    Use research_lcdeep.agent.chat() instead.

    Args:
        initial_query: Optional query to run immediately

    Raises:
        NotImplementedError: This function is no longer implemented
    """
    raise NotImplementedError(
        "research_claude.chat() is deprecated. "
        "Use research_lcdeep.agent.chat() instead."
    )
