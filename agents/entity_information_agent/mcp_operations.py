"""MCP operations wrapper for BrightData web scraping tools."""

import asyncio
import os
from typing import Optional, Dict, Any, List
from datetime import datetime
from contextlib import asynccontextmanager
from mcp import ClientSession
from mcp.client.sse import sse_client
from langchain_mcp_adapters.tools import load_mcp_tools
from models import WebsiteContent


# Global MCP client management
_mcp_context_stack = None
_mcp_session = None
_mcp_tools = None


@asynccontextmanager
async def mcp_session():
    """
    Context manager for MCP session.
    Use this to properly manage the MCP connection lifecycle.

    Example:
        async with mcp_session() as tools:
            # Use tools here
            result = await tools[0].ainvoke({"url": "https://example.com"})
    """
    # Get API token from environment
    api_token = os.getenv("BRIGHTDATA_API_KEY") or os.getenv("API_TOKEN")
    if not api_token:
        print("❌ No BRIGHTDATA_API_KEY or API_TOKEN found in environment")
        yield None
        return

    # BrightData MCP SSE endpoint
    sse_url = f"https://mcp.brightdata.com/sse?token={api_token}"

    print("🔌 Connecting to BrightData MCP (SSE transport)...")

    try:
        # Create SSE client connection with proper context management
        async with sse_client(sse_url) as (read, write):
            async with ClientSession(read, write) as session:
                # Initialize the session
                await session.initialize()

                # Load tools using langchain adapter
                tools = await load_mcp_tools(session)

                print(f"✅ MCP session initialized successfully")
                print(f"   Loaded {len(tools)} tools from BrightData:")
                for tool in tools:
                    print(f"   - {tool.name}")

                yield tools

                print("✅ MCP session closed")

    except Exception as e:
        print(f"❌ Failed to initialize MCP session: {e}")
        import traceback
        traceback.print_exc()
        yield None


async def initialize_mcp_session():
    """
    Legacy function for backwards compatibility.
    Note: This should only be used in sync code paths.
    For proper async usage, use the mcp_session() context manager instead.
    """
    print("⚠️  Warning: initialize_mcp_session() is deprecated.")
    print("   Use 'async with mcp_session() as tools:' instead for proper lifecycle management.")
    return None


async def close_mcp_session():
    """Legacy function for backwards compatibility."""
    pass


async def scrape_website(
    url: str,
    wait_for_selector: Optional[str] = None,
    extract_metadata: bool = True
) -> Optional[WebsiteContent]:
    """
    Scrape a website using BrightData MCP tools.

    Args:
        url: URL to scrape
        wait_for_selector: CSS selector to wait for before scraping
        extract_metadata: Whether to extract metadata

    Returns:
        WebsiteContent object with scraped data
    """
    async with mcp_session() as tools:
        if not tools:
            print(f"❌ MCP tools not available for scraping {url}")
            return None

        try:
            # Find the scrape tool (scrape_as_markdown)
            scrape_tool = None
            for tool in tools:
                if "markdown" in tool.name.lower() or "scrape" in tool.name.lower():
                    if "batch" not in tool.name.lower():  # Skip batch version
                        scrape_tool = tool
                        break

            if not scrape_tool:
                print("❌ Scrape tool not found in MCP tools")
                return None

            # Prepare scraping parameters
            scrape_params = {"url": url}

            # Execute scraping
            print(f"🔍 Scraping {url}...")
            result = await scrape_tool.ainvoke(scrape_params)

            if result:
                # Result is markdown text
                content_text = result if isinstance(result, str) else str(result)

                content = WebsiteContent(
                    url=url,
                    content=content_text,
                    title=None,  # Extract from markdown if needed
                    metadata=None,
                    scraped_at=datetime.utcnow().isoformat()
                )
                print(f"✅ Successfully scraped {url}")
                return content
            else:
                print(f"❌ No content returned from {url}")
                return None

        except Exception as e:
            print(f"❌ Error scraping {url}: {e}")
            import traceback
            traceback.print_exc()
            return None


async def search_and_scrape(
    query: str,
    num_results: int = 3,
    scrape_results: bool = True
) -> List[Dict[str, Any]]:
    """
    Search using BrightData SERP and optionally scrape the results.

    Args:
        query: Search query
        num_results: Number of results to process
        scrape_results: Whether to scrape the found URLs

    Returns:
        List of search results with optional scraped content
    """
    async with mcp_session() as tools:
        if not tools:
            return []

        results = []

        try:
            # Find the search engine tool
            search_tool = None
            for tool in tools:
                if "search_engine" in tool.name.lower():
                    if "batch" not in tool.name.lower():  # Skip batch version
                        search_tool = tool
                        break

            if not search_tool:
                print("❌ Search engine tool not found in MCP tools")
                return []

            # Execute search
            print(f"🔍 Searching for: {query}")
            search_result = await search_tool.ainvoke({
                "query": query,
                "engine": "google"  # Use Google by default
            })

            if not search_result:
                return []

            # Parse results (BrightData returns markdown or JSON)
            # For now, just return the raw result
            # You may need to parse this based on the actual format returned
            print(f"✅ Search completed")

            # Note: The actual parsing of search results depends on the format
            # returned by BrightData's search_engine tool
            return [{"raw_result": search_result}]

        except Exception as e:
            print(f"❌ Error in search_and_scrape: {e}")
            import traceback
            traceback.print_exc()
            return []


async def extract_political_data_from_website(
    url: str,
    entity_name: str
) -> Optional[Dict[str, Any]]:
    """
    Specialized scraping for political/administrative websites.

    Args:
        url: Official website URL
        entity_name: Name of the entity for context

    Returns:
        Dictionary with extracted political data
    """
    content = await scrape_website(url)
    if not content:
        return None

    # Common selectors for Italian government websites
    selectors = {
        "mayor": [
            ".sindaco", "#sindaco", ".mayor", "[class*='sindaco']",
            ".amministrazione h2", ".giunta"
        ],
        "council": [
            ".consiglio", "#consiglio", ".council", "[class*='consiglio']",
            ".delibere", ".giunta-comunale"
        ],
        "contacts": [
            ".contatti", "#contatti", ".contacts", ".uffici",
            ".orari", ".sede"
        ],
        "news": [
            ".news", ".notizie", ".avvisi", ".comunicati",
            "#news", ".albo-pretorio"
        ]
    }

    political_data = {
        "url": url,
        "entity_name": entity_name,
        "scraped_at": content.scraped_at,
        "sections": {}
    }

    # Try to scrape specific sections
    for section_name, selector_list in selectors.items():
        for selector in selector_list:
            section_content = await scrape_website(
                url,
                wait_for_selector=selector
            )
            if section_content and section_content.content:
                political_data["sections"][section_name] = section_content.content[:1000]  # Limit size
                break

    # Extract raw content for LLM processing
    political_data["raw_content"] = content.content[:5000]  # First 5000 chars for LLM

    return political_data if political_data["sections"] else None


# Utility functions for synchronous code
def scrape_website_sync(url: str, **kwargs) -> Optional[WebsiteContent]:
    """
    Synchronous wrapper for scrape_website.
    Creates a new event loop to run the async function.
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(scrape_website(url, **kwargs))
        finally:
            loop.close()
    except Exception as e:
        print(f"❌ Error in scrape_website_sync: {e}")
        import traceback
        traceback.print_exc()
        return None


def search_and_scrape_sync(query: str, **kwargs) -> List[Dict[str, Any]]:
    """
    Synchronous wrapper for search_and_scrape.
    Creates a new event loop to run the async function.
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(search_and_scrape(query, **kwargs))
        finally:
            loop.close()
    except Exception as e:
        print(f"❌ Error in search_and_scrape_sync: {e}")
        return []