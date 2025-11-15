"""Simple test for MCP integration with proper context management."""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

from mcp_operations import mcp_session, scrape_website


async def test_mcp_tools():
    """Test MCP tools with context manager."""
    print("="*70)
    print("🧪 Test 1: MCP Tools with Context Manager")
    print("="*70)

    async with mcp_session() as tools:
        if not tools:
            print("❌ Failed to load tools")
            return False

        print(f"\n✅ Loaded {len(tools)} tools successfully\n")

        # Test scraping
        print("🔍 Testing scrape tool...")
        scrape_tool = None
        for tool in tools:
            if "markdown" in tool.name.lower() and "batch" not in tool.name.lower():
                scrape_tool = tool
                break

        if scrape_tool:
            result = await scrape_tool.ainvoke({"url": "https://example.com"})
            print(f"✅ Scraping successful!")
            print(f"\nPreview:\n{str(result)[:200]}...\n")
        else:
            print("⚠️  No scrape tool found")

    print("="*70)
    return True


async def test_scrape_function():
    """Test the scrape_website function."""
    print("="*70)
    print("🧪 Test 2: scrape_website() Function")
    print("="*70)

    result = await scrape_website("https://en.wikipedia.org/wiki/Bologna")

    if result:
        print(f"\n✅ Successfully scraped Wikipedia!")
        print(f"   URL: {result.url}")
        print(f"   Content length: {len(result.content)} chars")
        print(f"\n   Preview:\n{result.content[:300]}...\n")
        return True
    else:
        print("\n❌ Scraping failed")
        return False


async def main():
    """Run tests."""
    print("\n" + "="*70)
    print("🚀 MCP Integration Test Suite")
    print("="*70 + "\n")

    # Test 1: Context manager
    test1_ok = await test_mcp_tools()

    # Test 2: scrape_website function
    test2_ok = await test_scrape_function()

    # Summary
    print("="*70)
    if test1_ok and test2_ok:
        print("✅ All tests passed!")
    else:
        print("⚠️  Some tests failed")
    print("="*70)


if __name__ == "__main__":
    asyncio.run(main())
