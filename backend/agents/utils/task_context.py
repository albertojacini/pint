"""Context variable for tracking current research task ID across async operations."""

from contextvars import ContextVar
from typing import Optional

# Context variable to store the current task_id
# This is automatically isolated per async task/request
current_task_id: ContextVar[Optional[str]] = ContextVar('current_task_id', default=None)


def get_current_task_id() -> str:
    """
    Get the current task_id from context.

    Raises:
        RuntimeError: If no task_id is set in context

    Returns:
        The current task_id
    """
    task_id = current_task_id.get()
    if task_id is None:
        raise RuntimeError(
            "No task_id set in context. "
            "This should be set by the agent run function before executing."
        )
    return task_id


def set_current_task_id(task_id: str) -> None:
    """
    Set the current task_id in context.

    Args:
        task_id: The task_id to set
    """
    current_task_id.set(task_id)
