"""Shared MCP client utility for connecting to multiple MCP servers."""

from langchain_mcp_adapters.client import MultiServerMCPClient
from dotenv import load_dotenv
import os


def get_mcp_client() -> MultiServerMCPClient:
    """
    Create and return a configured MultiServerMCPClient with BrightData and Wikipedia.

    Returns:
        MultiServerMCPClient configured with BrightData (SSE) and Wikipedia (STDIO) servers

    Raises:
        ValueError: If BRIGHTDATA_API_KEY is not set in environment
    """
    load_dotenv()

    # Get BrightData token from environment
    brightdata_token = os.getenv("BRIGHTDATA_API_KEY")
    if not brightdata_token:
        raise ValueError("BRIGHTDATA_API_KEY environment variable is not set")

    # Get the absolute path to the wikipedia MCP server
    agents_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    wikipedia_server_path = os.path.join(agents_dir, "wikipedia_mcp_server.py")

    client = MultiServerMCPClient({
        "brightdata": {
            "url": f"https://mcp.brightdata.com/sse?token={brightdata_token}",
            "transport": "sse",
        },
        "wikipedia": {
            "command": "python",
            "args": [wikipedia_server_path],
            "transport": "stdio",
        }
    })

    return client


async def get_mcp_tools():
    """
    Get tools from the MCP client.

    Returns:
        List of tools available from all configured MCP servers
    """
    client = get_mcp_client()
    tools = await client.get_tools()
    return tools
