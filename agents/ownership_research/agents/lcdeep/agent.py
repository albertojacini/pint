"""LangChain + deepagents + MCP ownership research agent."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from typing import Union, Any
from utils.base_agent import create_research_agent
from ownership_research.models import OwnershipOutput, OwnershipResearchError
from ownership_research.utils.prompt_builder import build_prompt


async def create_lcdeep_ownership_agent(debug: bool = False):
    """
    Create LangChain + deepagents + MCP ownership research agent.

    Args:
        debug: Enable debug logging

    Returns:
        Tuple of (agent, mcp_client)
    """
    system_prompt = build_prompt("lcdeep")

    return await create_research_agent(
        system_prompt=system_prompt,
        response_format=Union[OwnershipOutput, OwnershipResearchError],
        tool_names=["search_engine", "scrape_as_markdown", "query_wikipedia"],
        debug=debug,
    )


class LCDeepRunner:
    """LangChain + deepagents + MCP implementation wrapper."""

    async def run(self, description: str, debug: bool = False) -> dict[str, Any]:
        """
        Run the lcdeep agent on a description.

        Args:
            description: Public asset description to research
            debug: Enable debug logging

        Returns:
            Result dict (OwnershipOutput or OwnershipResearchError as dict)
        """
        agent, mcp_client = await create_lcdeep_ownership_agent(debug=debug)

        user_message = f"""Research the following public asset/holding:

**Description**: {description}"""

        result = await agent.ainvoke({
            "messages": [{"role": "user", "content": user_message}]
        })

        # Extract structured output (same logic as before)
        messages = result.get("messages", [])
        final_message = messages[-1] if messages else None

        if final_message:
            content = final_message.content if hasattr(final_message, 'content') else str(final_message)

            # Try structured output first
            if hasattr(final_message, 'parsed') and final_message.parsed:
                parsed = final_message.parsed
                if isinstance(parsed, (OwnershipOutput, OwnershipResearchError)):
                    return parsed.model_dump()
                if hasattr(parsed, 'model_dump'):
                    return parsed.model_dump()
                return parsed

            if 'structured_response' in result:
                sr = result['structured_response']
                if hasattr(sr, 'model_dump'):
                    return sr.model_dump()
                return sr

            # Fallback to regex extraction
            from api.services.research import extract_json_from_response
            return extract_json_from_response(content)

        return None


# Create singleton instance
lcdeep_runner = LCDeepRunner()
