"""Test script for BrightData MCP with detailed logging."""

import os
import asyncio
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def test_mcp_initialization():
    """Test MCP initialization and see what tools become available."""
    print("\n" + "="*70)
    print("🚀 TESTING BRIGHTDATA MCP INITIALIZATION")
    print("="*70)

    # Check environment variables
    print("\n📋 Checking Environment Variables:")
    api_token = os.getenv("API_TOKEN")
    brightdata_api_key = os.getenv("BRIGHTDATA_API_KEY")
    web_unlocker_zone = os.getenv("WEB_UNLOCKER_ZONE")
    browser_zone = os.getenv("BROWSER_ZONE")
    pro_mode = os.getenv("PRO_MODE")

    print(f"   API_TOKEN: {'✅ Set' if api_token else '❌ Not set'}")
    print(f"   BRIGHTDATA_API_KEY: {'✅ Set' if brightdata_api_key else '❌ Not set'}")
    print(f"   WEB_UNLOCKER_ZONE: {web_unlocker_zone if web_unlocker_zone else '⚪ Not set (will use default)'}")
    print(f"   BROWSER_ZONE: {browser_zone if browser_zone else '⚪ Not set (will use default)'}")
    print(f"   PRO_MODE: {pro_mode if pro_mode else '⚪ Not set (free tier)'}")

    if not api_token:
        print("\n⚠️  API_TOKEN not set. Trying to use BRIGHTDATA_API_KEY as fallback...")
        if brightdata_api_key:
            os.environ["API_TOKEN"] = brightdata_api_key
            print("   ✅ Using BRIGHTDATA_API_KEY as API_TOKEN")
        else:
            print("   ❌ No API token available. MCP cannot initialize.")
            return False

    # Import MCP operations
    print("\n📦 Importing MCP operations...")
    try:
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client
        from langchain_mcp_adapters.tools import load_mcp_tools
        print("   ✅ MCP modules imported successfully")
    except ImportError as e:
        print(f"   ❌ Failed to import MCP modules: {e}")
        return False

    # Set up server parameters
    print("\n⚙️  Setting up MCP server parameters...")
    server_params = StdioServerParameters(
        command="npx",
        env={
            "API_TOKEN": os.getenv("API_TOKEN"),
            "BROWSER_AUTH": os.getenv("BROWSER_AUTH", ""),
            "WEB_UNLOCKER_ZONE": os.getenv("WEB_UNLOCKER_ZONE", ""),
            "PRO_MODE": os.getenv("PRO_MODE", "false"),
        },
        args=["@brightdata/mcp"],
    )
    print(f"   Command: {server_params.command}")
    print(f"   Args: {server_params.args}")
    print(f"   Environment variables configured")

    # Initialize MCP session
    print("\n🔌 Initializing MCP session...")
    print("   This may take a moment on first run...")
    print("   (BrightData will auto-create zones if this is your first time)")

    try:
        async with stdio_client(server_params) as (read, write):
            print("   ✅ Stdio client connected")

            async with ClientSession(read, write) as session:
                print("   ✅ Client session created")

                print("\n🔧 Initializing session...")
                await session.initialize()
                print("   ✅ Session initialized")

                print("\n📚 Loading available tools...")
                tools = await load_mcp_tools(session)
                print(f"   ✅ Loaded {len(tools)} tools")

                # List all available tools
                print("\n" + "="*70)
                print(f"📋 AVAILABLE MCP TOOLS ({len(tools)} total):")
                print("="*70)

                for i, tool in enumerate(tools, 1):
                    print(f"\n{i}. {tool.name}")
                    print(f"   Description: {tool.description}")
                    if hasattr(tool, 'args_schema') and tool.args_schema:
                        print(f"   Parameters: {list(tool.args_schema.__fields__.keys())}")

                return tools

    except Exception as e:
        print(f"\n❌ MCP initialization failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        print(f"\n   Full traceback:")
        traceback.print_exc()
        return False


async def test_mcp_scraping(tools):
    """Test MCP scraping functionality."""
    if not tools:
        print("\n⚠️  No tools available, skipping scrape test")
        return

    print("\n" + "="*70)
    print("🕷️  TESTING MCP SCRAPING")
    print("="*70)

    # Find the scraping tool
    scrape_tool = None
    for tool in tools:
        if "scrape" in tool.name.lower() or "markdown" in tool.name.lower():
            scrape_tool = tool
            break

    if not scrape_tool:
        print("\n⚠️  No scraping tool found. Available tools:")
        for tool in tools:
            print(f"   - {tool.name}")
        return

    print(f"\n✅ Found scraping tool: {scrape_tool.name}")
    print(f"   Description: {scrape_tool.description}")

    # Test scraping a simple webpage
    test_url = "https://en.wikipedia.org/wiki/Bologna"
    print(f"\n🔍 Testing scrape on: {test_url}")
    print("   This will:")
    print("   1. Connect to BrightData's MCP server")
    print("   2. Use the mcp_unlocker zone")
    print("   3. Fetch and convert the page to markdown")

    try:
        print("\n⏳ Scraping in progress...")
        result = await scrape_tool.ainvoke({"url": test_url})

        print("\n✅ Scraping successful!")
        print(f"\n📄 Result preview (first 500 chars):")
        print("-" * 70)
        if isinstance(result, str):
            print(result[:500])
        elif isinstance(result, dict):
            content = result.get("content", result.get("markdown", str(result)))
            print(str(content)[:500])
        else:
            print(str(result)[:500])
        print("-" * 70)

        print(f"\n📊 Result type: {type(result)}")
        if isinstance(result, dict):
            print(f"   Keys: {list(result.keys())}")

    except Exception as e:
        print(f"\n❌ Scraping failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        print(f"\n   Full traceback:")
        traceback.print_exc()


async def test_mcp_search(tools):
    """Test MCP search functionality."""
    if not tools:
        print("\n⚠️  No tools available, skipping search test")
        return

    print("\n" + "="*70)
    print("🔍 TESTING MCP SEARCH")
    print("="*70)

    # Find the search tool
    search_tool = None
    for tool in tools:
        if "search" in tool.name.lower():
            search_tool = tool
            break

    if not search_tool:
        print("\n⚠️  No search tool found")
        return

    print(f"\n✅ Found search tool: {search_tool.name}")
    print(f"   Description: {search_tool.description}")

    # Test search
    test_query = "Bologna Italy mayor"
    print(f"\n🔍 Testing search query: '{test_query}'")

    try:
        print("\n⏳ Searching...")
        result = await search_tool.ainvoke({"query": test_query})

        print("\n✅ Search successful!")
        print(f"\n📄 Result preview (first 500 chars):")
        print("-" * 70)
        if isinstance(result, str):
            print(result[:500])
        elif isinstance(result, dict):
            print(str(result)[:500])
        else:
            print(str(result)[:500])
        print("-" * 70)

    except Exception as e:
        print(f"\n❌ Search failed: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Run all MCP tests."""
    print("\n" + "="*70)
    print("🧪 BRIGHTDATA MCP TESTING SUITE")
    print("="*70)
    print("\nThis script will:")
    print("  1. Check your environment configuration")
    print("  2. Initialize the MCP server")
    print("  3. List all available tools")
    print("  4. Test scraping a webpage")
    print("  5. Test search functionality")
    print("\n" + "="*70)

    # Test initialization
    tools = await test_mcp_initialization()

    if not tools:
        print("\n❌ MCP initialization failed. Cannot continue with tests.")
        print("\nTroubleshooting:")
        print("  1. Make sure you have an API_TOKEN or BRIGHTDATA_API_KEY set")
        print("  2. Ensure your token has Admin permissions")
        print("  3. Check your internet connection")
        print("  4. Verify npx and @brightdata/mcp are installed:")
        print("     Run: npx @brightdata/mcp --version")
        return

    # Test scraping
    await test_mcp_scraping(tools)

    # Test search
    await test_mcp_search(tools)

    print("\n" + "="*70)
    print("✅ MCP TESTING COMPLETE")
    print("="*70)


if __name__ == "__main__":
    asyncio.run(main())
