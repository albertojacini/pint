"""Agent configuration for avatar generation."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from typing import Union
from utils.base_agent import create_research_agent
from avatar_generation.models import AvatarOutput, AvatarGenerationError
from avatar_generation.tools import create_avatar_tools


def load_prompt(filename: str) -> str:
    """Load a prompt file from the prompts directory."""
    prompt_path = Path(__file__).parent / "prompts" / filename
    return prompt_path.read_text()


async def create_avatar_generation_agent(debug: bool = False):
    """
    Create agent for avatar/logo generation.

    Returns:
        Tuple of (agent, mcp_client)
    """
    system_prompt = load_prompt("system_prompt.md")

    # Get custom avatar tools
    custom_tools = create_avatar_tools()

    return await create_research_agent(
        system_prompt=system_prompt,
        response_format=Union[AvatarOutput, AvatarGenerationError],
        tool_names=[],  # No MCP tools needed
        custom_tools=custom_tools,
        debug=debug,
    )
