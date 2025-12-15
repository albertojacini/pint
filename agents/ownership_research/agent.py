"""Agent configuration for ownership research."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from typing import Union
from utils.base_agent import create_research_agent
from ownership_research.models import OwnershipOutput, OwnershipResearchError


def load_prompt(filename: str) -> str:
    """Load a prompt file from the prompts directory."""
    prompt_path = Path(__file__).parent / "prompts" / filename
    return prompt_path.read_text()


async def create_ownership_research_agent(debug: bool = False):
    """
    Create research agent for public assets/holdings.

    Returns:
        Tuple of (agent, mcp_client)
    """
    system_prompt = load_prompt("system_prompt.md")

    return await create_research_agent(
        system_prompt=system_prompt,
        response_format=Union[OwnershipOutput, OwnershipResearchError],
        debug=debug,
    )
