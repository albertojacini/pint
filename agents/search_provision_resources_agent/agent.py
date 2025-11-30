"""Deep agent configuration for provision resource search."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from deepagents import create_deep_agent, FilesystemMiddleware, SubAgentMiddleware
from deepagents.backends import FilesystemBackend
from langchain.agents.middleware import TodoListMiddleware
from utils.mcp_client import get_mcp_client
from search_provision_resources_agent.tools.url_validator import validate_provision_url


async def create_search_agent():
    """
    Create deep agent with middleware and tools.

    Returns:
        Configured deep agent ready to search for provision resources
    """
    # Get MCP tools (BrightData search)
    mcp_client = get_mcp_client()
    mcp_tools = await mcp_client.get_tools()

    # Filter to search-related tools
    search_tools = [t for t in mcp_tools if 'search' in t.name.lower()]

    print(f"Loaded {len(search_tools)} search tools: {[t.name for t in search_tools]}")

    # Load system prompt
    prompt_path = Path(__file__).parent / "prompts" / "system_prompt.txt"
    system_prompt = prompt_path.read_text()

    # Create filesystem backend for logging
    fs_backend = FilesystemBackend(root_dir="/tmp/search_provision_agent")

    # Create deep agent
    # Note: create_deep_agent includes default middleware (TodoList, Filesystem, SubAgent)
    agent = create_deep_agent(
        model="claude-3-5-sonnet-latest",
        tools=search_tools,
        system_prompt=system_prompt,
        backend=fs_backend
    )

    return agent, mcp_client
