import asyncio
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

#from graph import graph
#from models import AgentState
from langchain.agents import create_agent
from utils.mcp_client import get_mcp_client
from pydantic import BaseModel

# Initialize MCP client - will be done lazily
logger.info("MCP client will be initialized when needed")
mcp_client = None





class EntityData(BaseModel):
    """Extracted entity data."""
    name: str
    description: str
    population: Optional[int] = None



async def run_agent(entity_input: str):
    """Run the entity enrichment agent."""
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

    search_tools = [t for t in tools if t.name in ["query_wikipedia", "search_engine"]]
    logger.info(f"Filtered to {len(search_tools)} search tools: {[t.name for t in search_tools]}")

    logger.info("Creating agent...")
    agent = create_agent(
        "gpt-5",
        search_tools,
        # system_prompt="...",
        # middleware=
        response_format=EntityData,
    )
    logger.info("Agent created, invoking...")

    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": f"Extract entity info for {entity_input}"}]
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
