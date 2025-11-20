"""
Advanced entity administrations agent using tool wrapping middleware
to extract only relevant content before it enters context.
"""

import asyncio
import sys
from pathlib import Path
from typing import List, Optional, Literal
import logging

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from langchain.agents import create_agent
from langchain.agents.middleware import AgentMiddleware
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from utils.mcp_client import get_mcp_client
from pydantic import BaseModel, Field

# Initialize MCP client
mcp_client = None


# ==================== SCHEMA DEFINITIONS ====================

class Person(BaseModel):
    """Person data matching the people table."""
    full_name: str = Field(description="Full name of the person")
    avatar_url: Optional[str] = Field(default=None, description="URL to person's avatar/photo")


class AdministrationMember(BaseModel):
    """Administration member data matching the administration_members table."""
    person: Person = Field(description="Person who is/was a member")
    role_type: Literal['mayor', 'councilor', 'minister', 'president', 'governor', 'member'] = Field(
        description="Type of role in the administration"
    )
    role_title: Optional[str] = Field(default=None, description="Specific title of the role")
    appointed_at: str = Field(description="Date when appointed (ISO format YYYY-MM-DD)")
    left_at: Optional[str] = Field(default=None, description="Date when left office (ISO format YYYY-MM-DD)")
    status: Literal['active', 'historical'] = Field(description="Current status of the membership")


class Administration(BaseModel):
    """Administration data matching the administrations table."""
    name: str = Field(description="Name of the administration")
    term_start: str = Field(description="Start date of the term (ISO format YYYY-MM-DD)")
    term_end: Optional[str] = Field(default=None, description="End date of the term (ISO format YYYY-MM-DD)")
    status: Literal['active', 'historical', 'upcoming'] = Field(description="Status of the administration")
    description: Optional[str] = Field(default=None, description="Description of the administration")
    members: List[AdministrationMember] = Field(default_factory=list)


class AdministrationsData(BaseModel):
    """Complete output with all administrations for an entity from the last 10 years."""
    entity_name: str = Field(description="Name of the political entity")
    administrations: List[Administration] = Field(description="List of all administrations")


# ==================== MIDDLEWARE ====================

class AdministrationExtractionMiddleware(AgentMiddleware):
    """Middleware that extracts administration data from tool outputs before they enter context."""

    def __init__(self):
        super().__init__()
        self.extraction_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    async def awrap_tool_call(self, tool_call, handler):
        """Wrap tool calls to extract only administration-relevant content (async version)."""
        tool_name = tool_call.name if hasattr(tool_call, 'name') else str(tool_call)

        # Execute the original tool call
        result = await handler(tool_call)

        # Only process content-heavy tools
        if tool_name not in ['query_wikipedia', 'scrape_as_markdown', 'search_engine']:
            return result

        logger.info(f"🔍 Extracting administration data from {tool_name} result...")

        # Extract only administration-relevant content
        try:
            extracted = await self._extract_relevant_content(result, tool_name)

            # Return the condensed version instead of full content
            logger.info(f"✂️  Condensed {tool_name} output from {len(str(result))} to {len(extracted)} chars")
            return extracted

        except Exception as e:
            logger.error(f"Error extracting content: {e}")
            # If extraction fails, truncate the result
            return str(result)[:2000] + "\n...[truncated]..."

    async def _extract_relevant_content(self, content: str, tool_name: str) -> str:
        """Use LLM to extract only administration-relevant parts."""

        # Limit input size to avoid token issues
        content_preview = str(content)[:5000]

        extraction_prompt = f"""Extract ONLY information about government administrations from this {tool_name} result.

Focus on:
- Names of administrations/governments (with dates)
- Names of people and their roles (mayors, ministers, councilors, etc.)
- Start and end dates of terms
- Any election results or government formation info

Ignore everything else. Be concise.

Content:
{content_preview}

Return ONLY the relevant extracted information, formatted clearly."""

        try:
            response = await self.extraction_llm.ainvoke([HumanMessage(content=extraction_prompt)])
            return response.content
        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
            return content_preview




# ==================== AGENT EXECUTION ====================

async def run_agent(entity_input: str):
    """Run the advanced entity administrations agent."""
    logger.info(f"Starting advanced agent for entity: {entity_input}")

    # Initialize MCP client
    logger.info("Initializing MCP client...")
    global mcp_client
    mcp_client = get_mcp_client()

    # Get tools
    logger.info("Getting tools from MCP client...")
    try:
        tools = await asyncio.wait_for(mcp_client.get_tools(), timeout=30.0)
        logger.info(f"Got {len(tools)} tools")
    except Exception as e:
        logger.error(f"Error getting tools: {e}")
        raise

    # Filter to search tools
    search_tools = [t for t in tools if t.name in ["query_wikipedia", "search_engine", "scrape_as_markdown"]]
    logger.info(f"Using {len(search_tools)} search tools")

    # System prompt
    system_prompt = f"""You are an expert at finding government administration data for political entities.

Your task is to find all administrations (governments) for {entity_input} from the last 10 years.

STRATEGY:
1. Start by searching Wikipedia for "{entity_input} elections" and "{entity_input} government"
2. For each administration found, search for detailed member information
3. Compile all findings into the final output

SEARCH PRIORITY:
1. Wikipedia first (use query_wikipedia tool)
2. Official government websites if needed
3. Other reliable sources

IMPORTANT:
- Tool outputs are automatically condensed to show only administration-relevant content
- Output language should match the entity's language
- Find administrations from the last 10 years
- Include member information when available (names, roles, dates)
- Mark status as 'active' for current, 'historical' for past administrations
"""

    # Create middleware stack
    middleware = [
        AdministrationExtractionMiddleware(),  # Extract only relevant content from tool outputs
    ]

    logger.info("Creating agent with extraction middleware...")
    agent = create_agent(
        "gpt-4o",
        search_tools,
        response_format=AdministrationsData,
        system_prompt=system_prompt,
        middleware=middleware,
    )

    logger.info("Invoking agent...")
    result = await agent.ainvoke({
        "messages": [{
            "role": "user",
            "content": f"Find all administrations from the last 10 years for: {entity_input}"
        }]
    })

    logger.info(f"Agent completed with {len(result.administrations)} administrations")
    return result


async def main():
    """Main entry point."""
    logger.info("Starting main...")

    # Get entity input from command line or use default
    if len(sys.argv) > 1:
        entity_input = " ".join(sys.argv[1:])
    else:
        entity_input = "Milan"
        logger.info(f"No entity provided, using default: {entity_input}")

    result = await run_agent(entity_input)

    # Pretty print results
    print(f"\n{'='*70}")
    print(f"🏛️  ADMINISTRATIONS FOR: {result.entity_name}")
    print(f"{'='*70}\n")

    for i, admin in enumerate(result.administrations, 1):
        print(f"\n{i}. {admin.name}")
        print(f"   📅 Term: {admin.term_start} to {admin.term_end or 'present'}")
        print(f"   📊 Status: {admin.status}")

        if admin.description:
            print(f"   📝 {admin.description}")

        if admin.members:
            print(f"   👥 Members ({len(admin.members)}):")
            for member in admin.members[:10]:
                role = member.role_title or member.role_type
                print(f"      • {member.person.full_name} - {role}")

            if len(admin.members) > 10:
                print(f"      ... and {len(admin.members) - 10} more")

    print(f"\n{'='*70}")
    print(f"✅ Found {len(result.administrations)} administrations total")
    print(f"{'='*70}\n")

    return result


if __name__ == "__main__":
    asyncio.run(main())
