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
from utils.mcp_client import get_mcp_client
from pydantic import BaseModel, Field

# Initialize MCP client - will be done lazily
logger.info("MCP client will be initialized when needed")
mcp_client = None


# Schema matching database structure
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
    name: str = Field(description="Name of the administration (e.g., 'Sala Administration 2016-2021')")
    term_start: str = Field(description="Start date of the term (ISO format YYYY-MM-DD)")
    term_end: Optional[str] = Field(default=None, description="End date of the term (ISO format YYYY-MM-DD)")
    status: Literal['active', 'historical', 'upcoming'] = Field(
        description="Status of the administration"
    )
    description: Optional[str] = Field(default=None, description="Description of the administration")
    members: List[AdministrationMember] = Field(
        default_factory=list,
        description="List of administration members with their roles"
    )


class AdministrationsData(BaseModel):
    """Complete output with all administrations for an entity from the last 10 years."""
    entity_name: str = Field(description="Name of the political entity")
    administrations: List[Administration] = Field(
        description="List of all administrations from the last 10 years, ordered chronologically"
    )


async def run_agent(entity_input: str):
    """Run the entity administrations agent."""
    logger.info(f"Starting agent for entity: {entity_input}")

    # Initialize MCP client (lazy initialization)
    logger.info("Initializing MCP client...")
    global mcp_client
    mcp_client = get_mcp_client()
    logger.info("MCP client created")

    # Create ReAct agent with search tools
    logger.info("Getting tools from MCP client...")
    try:
        tools = await asyncio.wait_for(mcp_client.get_tools(), timeout=30.0)
        logger.info(f"Got {len(tools)} tools: {[t.name for t in tools]}")
    except asyncio.TimeoutError:
        logger.error("Timeout waiting for MCP tools - MCP client is hanging")
        raise
    except Exception as e:
        logger.error(f"Error getting tools: {e}", exc_info=True)
        raise

    # lsearch_engine` | BrightData | `query` | `engine`, `cursor` | Search Google/Bing/Yandex for current info |
    # || `scrape_as_markdown` | BrightData | `url` | - | Scrape single webpage to markdown |
    # || `search_engine_batch` | BrightData | `queries` (array) | - | Run up to 10 searches in parallel |
    # || `scrape_batch` | BrightData | `urls` (array) | - | Scrape up to 10 webpages in parallel |
    # || `query_wikipedia` | Wikipedia | `title` | `language` | Query Wikipedia articles |
    search_tools = [t for t in tools if t.name in ["query_wikipedia", "search_engine", ""]]

    logger.info(f"Filtered to {len(search_tools)} search tools: {[t.name for t in search_tools]}")

    system_prompt = """You are an expert at finding government administration data for political entities.

Your task is to find all administrations (governments) for the given political entity from the last 10 years.
STRATEGY:
- Start with defining which administrations were elected and ruled in the last 10 year. For this look for wikipedia pages about elections in the target political entity.
- Once you have a clear idea you go into details and try to find specific people that were part of the administration.

SEARCH PRIORITY (in order):
1. Wikipedia first (use query_wikipedia tool)
2. Official government websites
3. Other reliable sources

IMPORTANT:
- The output language should match the language of the political entity
- Find administrations from the last 10 years, not just the current one
- Include complete member information (names, roles, dates)
- Try to include all government members you can find (mayors, councilors, ministers, etc.). Do your best but give up when it sounds too complicated to collect more info
- Mark status as 'active' for current administrations, 'historical' for past ones
"""

    logger.info("Creating agent...")
    agent = create_agent(
        "gpt-5",
        search_tools,
        response_format=AdministrationsData,
        system_prompt=system_prompt
    )
    logger.info("Agent created, invoking...")

    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": f"Find all administrations from the last 10 years for: {entity_input}"}]
    })

    logger.info(f"Agent completed with result: {result}")
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
    logger.info("Agent run complete!")
    return result


if __name__ == "__main__":
    asyncio.run(main())
