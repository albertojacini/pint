#!/usr/bin/env python3
"""Simple MCP server that provides Wikipedia query tools."""

import asyncio
import httpx
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import json


# Create server instance
server = Server("wikipedia-mcp-server")


@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available Wikipedia tools."""
    return [
        Tool(
            name="query_wikipedia",
            description="Query Wikipedia API to get article content. Supports multiple languages (en, it, es, fr, de, etc.)",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The Wikipedia article title to query"
                    },
                    "language": {
                        "type": "string",
                        "description": "Wikipedia language code (e.g., 'en', 'it', 'es', 'fr', 'de')",
                        "default": "en"
                    }
                },
                "required": ["title"]
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool execution requests."""

    if name != "query_wikipedia":
        raise ValueError(f"Unknown tool: {name}")

    title = arguments.get("title")
    language = arguments.get("language", "en")

    if not title:
        raise ValueError("Title is required")

    # Build Wikipedia API URL
    url = f"https://{language}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": "1",
        "titles": title,
        "format": "json"
    }

    # Make the API request with proper User-Agent header (required by Wikipedia)
    headers = {
        "User-Agent": "Pint-Agent/1.0 (https://github.com/pint; contact@pint.com) httpx/1.0"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()

    # Extract the page content
    pages = data.get("query", {}).get("pages", {})

    if not pages:
        return [TextContent(type="text", text=f"No results found for '{title}'")]

    # Get the first (and usually only) page
    page = next(iter(pages.values()))

    if "missing" in page:
        return [TextContent(type="text", text=f"Article '{title}' not found in {language}.wikipedia.org")]

    extract = page.get("extract", "No content available")
    page_title = page.get("title", title)

    result = f"# {page_title}\n\n{extract}"

    return [TextContent(type="text", text=result)]


async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="wikipedia-mcp-server",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                )
            )
        )


if __name__ == "__main__":
    asyncio.run(main())
