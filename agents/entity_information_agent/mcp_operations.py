"""MCP operations wrapper for BrightData web scraping tools."""

import asyncio
import os
from typing import Optional, Dict, Any, List
from datetime import datetime
from mcp import ClientSession
from mcp.client.sse import sse_client
from langchain_mcp_adapters.tools import load_mcp_tools
from models import WebsiteContent


# Global MCP client management
_mcp_session = None
_mcp_tools = None


async def initialize_mcp_session():
    """Initialize the MCP session with BrightData tools using SSE transport."""
    global _mcp_session, _mcp_tools

    if _mcp_tools is not None:
        return _mcp_tools

    # Get API token from environment
    api_token = os.getenv("BRIGHTDATA_API_KEY") or os.getenv("API_TOKEN")
    if not api_token:
        print("❌ No BRIGHTDATA_API_KEY or API_TOKEN found in environment")
        return None

    try:
        # BrightData MCP SSE endpoint
        sse_url = f"https://mcp.brightdata.com/sse?token={api_token}"

        print("🔌 Connecting to BrightData MCP (SSE transport)...")
        print(f"   Endpoint: {sse_url}")

        # Create SSE client connection
        read, write = await sse_client(sse_url).__aenter__()
        _mcp_session = await ClientSession(read, write).__aenter__()

        # Initialize the session
        await _mcp_session.initialize()

        # Load tools using langchain adapter
        _mcp_tools = await load_mcp_tools(_mcp_session)

        print(f"✅ MCP session initialized successfully")
        print(f"   Loaded {len(_mcp_tools)} tools from BrightData:")
        for tool in _mcp_tools:
            print(f"   - {tool.name}: {tool.description}")

        return _mcp_tools
    except Exception as e:
        print(f"❌ Failed to initialize MCP session: {e}")
        import traceback
        traceback.print_exc()
        return None


async def close_mcp_session():
    """Close the MCP session."""
    global _mcp_session, _mcp_tools

    if _mcp_session:
        try:
            await _mcp_session.__aexit__(None, None, None)
            _mcp_session = None
            _mcp_tools = None
            print("✅ MCP session closed")
        except Exception as e:
            print(f"❌ Error closing MCP session: {e}")


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
    tools = await initialize_mcp_session()
    if not tools:
        print(f"❌ MCP tools not available for scraping {url}")
        return None

    try:
        # Find the browser tool
        browser_tool = None
        for tool in tools:
            if "browser" in tool.name.lower() or "scrape" in tool.name.lower():
                browser_tool = tool
                break

        if not browser_tool:
            print("❌ Browser tool not found in MCP tools")
            return None

        # Prepare scraping parameters
        scrape_params = {
            "url": url,
            "type": "text"  # Get text content
        }

        if wait_for_selector:
            scrape_params["wait_for"] = wait_for_selector

        # Execute scraping
        print(f"🔍 Scraping {url}...")
        result = await browser_tool.ainvoke(scrape_params)

        if result:
            content = WebsiteContent(
                url=url,
                content=result.get("content", ""),
                title=result.get("title"),
                metadata=result.get("metadata") if extract_metadata else None,
                scraped_at=datetime.utcnow().isoformat()
            )
            print(f"✅ Successfully scraped {url}")
            return content
        else:
            print(f"❌ No content returned from {url}")
            return None

    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
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
    tools = await initialize_mcp_session()
    if not tools:
        return []

    results = []

    try:
        # Find the SERP tool
        serp_tool = None
        for tool in tools:
            if "serp" in tool.name.lower() or "search" in tool.name.lower():
                serp_tool = tool
                break

        if not serp_tool:
            print("❌ SERP tool not found in MCP tools")
            return []

        # Execute search
        print(f"🔍 Searching for: {query}")
        search_results = await serp_tool.ainvoke({
            "query": query,
            "num": num_results
        })

        if not search_results:
            return []

        # Process results
        for idx, result in enumerate(search_results.get("results", [])[:num_results]):
            processed_result = {
                "title": result.get("title"),
                "url": result.get("url"),
                "snippet": result.get("snippet"),
                "position": idx + 1
            }

            # Optionally scrape the URL
            if scrape_results and processed_result["url"]:
                scraped_content = await scrape_website(processed_result["url"])
                if scraped_content:
                    processed_result["scraped_content"] = scraped_content.dict()

            results.append(processed_result)

        return results

    except Exception as e:
        print(f"❌ Error in search_and_scrape: {e}")
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


# Utility function for synchronous code
def scrape_website_sync(url: str, **kwargs) -> Optional[WebsiteContent]:
    """Synchronous wrapper for scrape_website."""
    return asyncio.run(scrape_website(url, **kwargs))


def search_and_scrape_sync(query: str, **kwargs) -> List[Dict[str, Any]]:
    """Synchronous wrapper for search_and_scrape."""
    return asyncio.run(search_and_scrape(query, **kwargs))