"""Scraper node - uses BrightData to scrape URLs to markdown."""

from provision_generator_agent.models import ScrapedPage
from utils.mcp_client import get_mcp_tools


async def scrape(url: str) -> ScrapedPage:
    """
    Scrape a URL and return its content as markdown.

    Args:
        url: The URL to scrape

    Returns:
        ScrapedPage with url and markdown_content
    """
    tools = await get_mcp_tools()
    scrape_tool = next(t for t in tools if t.name == "scrape_as_markdown")

    result = await scrape_tool.ainvoke({"url": url})

    return ScrapedPage(url=url, markdown_content=result)


async def scrape_batch(urls: list[str]) -> list[ScrapedPage]:
    """
    Scrape multiple URLs in parallel (max 10).

    Args:
        urls: List of URLs to scrape

    Returns:
        List of ScrapedPage objects
    """
    tools = await get_mcp_tools()
    scrape_tool = next(t for t in tools if t.name == "scrape_batch")

    # BrightData batch limit is 10
    if len(urls) > 10:
        raise ValueError("scrape_batch supports max 10 URLs")

    results = await scrape_tool.ainvoke({"urls": urls})

    return [
        ScrapedPage(url=url, markdown_content=content)
        for url, content in zip(urls, results)
    ]
