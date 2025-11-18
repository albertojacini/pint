"""Shared MCP client utility for connecting to multiple MCP servers."""

from langchain_mcp_adapters.client import MultiServerMCPClient
from dotenv import load_dotenv
import os


def get_mcp_client(use_brightdata: bool = False) -> MultiServerMCPClient:
    """
    Create and return a configured MultiServerMCPClient with BrightData and Wikipedia.

    Args:
        use_brightdata: If True, include BrightData server. Default False for faster startup.

    Returns:
        MultiServerMCPClient configured with Wikipedia (STDIO) and optionally BrightData (SSE)

    Raises:
        ValueError: If use_brightdata=True and BRIGHTDATA_API_KEY is not set in environment
    """
    load_dotenv()

    # Get the absolute path to the wikipedia MCP server
    agents_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    wikipedia_server_path = os.path.join(agents_dir, "wikipedia_mcp_server.py")

    connections = {
        "wikipedia": {
            "command": "python",
            "args": [wikipedia_server_path],
            "transport": "stdio",
        }
    }

    if use_brightdata:
        # Get BrightData token from environment
        brightdata_token = os.getenv("BRIGHTDATA_API_KEY")
        if not brightdata_token:
            raise ValueError("BRIGHTDATA_API_KEY environment variable is not set")

        connections["brightdata"] = {
            "url": f"https://mcp.brightdata.com/sse?token={brightdata_token}",
            "transport": "sse",
        }

    client = MultiServerMCPClient(connections)

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
