"""Deep agent configuration for provision generation."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from deepagents import create_deep_agent
from utils.mcp_client import get_mcp_client
from provision_generator.models import ProvisionOutput, ProvisionGeneratorError
from pydantic import BaseModel
from typing import Union


def load_prompt(filename: str) -> str:
    """Load a prompt file from the prompts directory."""
    prompt_path = Path(__file__).parent / "prompts" / filename
    return prompt_path.read_text()


def filter_tools_by_name(tools: list, names: list[str]) -> list:
    """Filter tools by name."""
    return [t for t in tools if t.name in names]


class ProvisionResponse(BaseModel):
    """Union response type for provision generation."""
    result: Union[ProvisionOutput, ProvisionGeneratorError]


async def create_provision_generator_agent():
    """
    Create deep agent with middleware and tools for provision generation.

    Returns:
        Tuple of (agent, mcp_client)
    """
    # Get MCP tools (BrightData search + Wikipedia)
    mcp_client = get_mcp_client()
    mcp_tools = await mcp_client.get_tools()

    print(f"Loaded {len(mcp_tools)} MCP tools: {[t.name for t in mcp_tools]}")

    # Load prompts
    system_prompt = load_prompt("system_prompt.txt")
    general_research_prompt = load_prompt("general_research.txt")
    type_research_prompt = load_prompt("type_research.txt")

    # Filter tools for main agent (search + wikipedia for coordination)
    main_agent_tools = filter_tools_by_name(mcp_tools, ["search_engine", "query_wikipedia"])

    # Filter tools for research subagents (search + scrape for detailed research)
    research_tools = filter_tools_by_name(mcp_tools, ["search_engine", "scrape_as_markdown", "query_wikipedia"])

    # Define subagents for specialized research phases
    general_researcher = {
        "name": "general-researcher",
        "description": "Research general provision information (title, description, dates, status). Use this for Phase 2 of the workflow.",
        "system_prompt": general_research_prompt,
        "tools": research_tools,
    }

    type_researcher = {
        "name": "type-researcher",
        "description": "Research type-specific provision details for extraData fields. Use this for Phase 3 of the workflow after determining the provision type.",
        "system_prompt": type_research_prompt,
        "tools": research_tools,
    }

    # Create deep agent with subagents
    # Default middleware: TodoListMiddleware, FilesystemMiddleware, SubAgentMiddleware
    agent = create_deep_agent(
        model="claude-sonnet-4-5-20250929",
        tools=main_agent_tools,
        system_prompt=system_prompt,
        subagents=[general_researcher, type_researcher],
        response_format=Union[ProvisionOutput, ProvisionGeneratorError],
    )

    return agent, mcp_client
