"""Base agent configuration - domain-agnostic research agent."""

from typing import Any, Type
from langchain_core.tools import BaseTool, StructuredTool
from deepagents import create_deep_agent
from utils.mcp_client import get_mcp_client
from pydantic import BaseModel


# Maximum characters to keep from tool output (roughly 10k tokens)
MAX_TOOL_OUTPUT_CHARS = 40000


def truncate_output(output: Any, max_chars: int = MAX_TOOL_OUTPUT_CHARS) -> Any:
    """Truncate string output to max_chars, adding a note if truncated."""
    if not isinstance(output, str):
        return output
    if len(output) <= max_chars:
        return output
    truncated = output[:max_chars]
    return f"{truncated}\n\n[... TRUNCATED - {len(output) - max_chars} characters removed ...]"


def create_truncating_tool(original_tool: BaseTool) -> StructuredTool:
    """Create a new tool that wraps the original with output truncation."""

    async def truncated_func(**kwargs) -> str:
        result = await original_tool.ainvoke(kwargs)
        return truncate_output(result)

    return StructuredTool.from_function(
        coroutine=truncated_func,
        name=original_tool.name,
        description=original_tool.description,
        args_schema=original_tool.args_schema,
    )


async def create_research_agent(
    system_prompt: str,
    response_format: Type[BaseModel],
    tool_names: list[str] | None = None,
    debug: bool = False,
):
    """
    Create a domain-agnostic research agent with MCP tools.

    This is a flat agent (no subagents) that performs research directly.

    Args:
        system_prompt: The system prompt for the agent (domain-specific)
        response_format: Pydantic model Union type for structured output
        tool_names: Optional list of tool names to use (None = all tools)
        debug: Enable debug mode

    Returns:
        Tuple of (agent, mcp_client)
    """
    # Get MCP tools (BrightData search + Wikipedia)
    mcp_client = get_mcp_client()
    mcp_tools = await mcp_client.get_tools()

    # Filter tools by name if specified
    if tool_names is not None:
        mcp_tools = [t for t in mcp_tools if t.name in tool_names]

    # Wrap tools with truncation to prevent context overflow
    wrapped_tools = [create_truncating_tool(tool) for tool in mcp_tools]

    print(f"Loaded {len(wrapped_tools)} MCP tools: {[t.name for t in wrapped_tools]}")

    # Create flat deep agent (no subagents)
    agent = create_deep_agent(
        tools=wrapped_tools,
        system_prompt=system_prompt,
        subagents=[],  # No subagents - flat architecture
        response_format=response_format,
        debug=debug,
    )

    return agent, mcp_client
