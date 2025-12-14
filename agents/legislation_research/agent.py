"""Deep agent configuration for legislation research."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from typing import Union
from deepagents import create_deep_agent
from utils.mcp_client import get_mcp_client
from legislation_research.models import LegislationOutput, LegislationResearchError


def load_prompt(filename: str) -> str:
    """Load a prompt file from the prompts directory."""
    prompt_path = Path(__file__).parent / "prompts" / filename
    return prompt_path.read_text()


async def create_legislation_research_agent():
    """
    Create deep agent with MCP tools for legislation research.

    This is a flat agent (no subagents) that performs all research directly.

    Returns:
        Tuple of (agent, mcp_client)
    """
    # Get MCP tools (BrightData search + Wikipedia)
    mcp_client = get_mcp_client()
    mcp_tools = await mcp_client.get_tools()

    print(f"Loaded {len(mcp_tools)} MCP tools: {[t.name for t in mcp_tools]}")

    # Load prompts
    system_prompt = load_prompt("system_prompt.txt")

    # Create flat deep agent (no subagents)
    agent = create_deep_agent(
        tools=mcp_tools,
        system_prompt=system_prompt,
        subagents=[],  # No subagents - flat architecture
        response_format=Union[LegislationOutput, LegislationResearchError],
    )

    return agent, mcp_client
