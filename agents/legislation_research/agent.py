"""Deep agent configuration for legislation research."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from typing import Union, Any
from langchain_core.tools import BaseTool, StructuredTool
from deepagents import create_deep_agent
from utils.mcp_client import get_mcp_client
from legislation_research.models import LegislationOutput, LegislationResearchError


# Maximum characters to keep from tool output (roughly 10k tokens)
MAX_TOOL_OUTPUT_CHARS = 40000


def load_prompt(filename: str) -> str:
    """Load a prompt file from the prompts directory."""
    prompt_path = Path(__file__).parent / "prompts" / filename
    return prompt_path.read_text()


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


async def create_legislation_research_agent(debug: bool = False):
    """
    Create deep agent with MCP tools for legislation research.

    This is a flat agent (no subagents) that performs all research directly.

    Returns:
        Tuple of (agent, mcp_client)
    """
    # Get MCP tools (BrightData search + Wikipedia)
    mcp_client = get_mcp_client()
    mcp_tools = await mcp_client.get_tools()

    # Wrap tools with truncation to prevent context overflow
    wrapped_tools = [create_truncating_tool(tool) for tool in mcp_tools]

    print(f"Loaded {len(wrapped_tools)} MCP tools: {[t.name for t in wrapped_tools]}")

    # Load prompts
    system_prompt = load_prompt("system_prompt.md")

    # Create flat deep agent (no subagents)
    agent = create_deep_agent(
        tools=wrapped_tools,
        system_prompt=system_prompt,
        subagents=[],  # No subagents - flat architecture
        response_format=Union[LegislationOutput, LegislationResearchError],
        debug=debug,
    )

    return agent, mcp_client
