"""Minimal test for SSE-based MCP connection."""

import asyncio
import os
from dotenv import load_dotenv
from mcp import ClientSession
from mcp.client.sse import sse_client
from langchain_mcp_adapters.tools import load_mcp_tools

load_dotenv()


async def test_mcp_connection():
    """Test basic MCP connection and tool loading."""

    # Get API token
    api_token = os.getenv("BRIGHTDATA_API_KEY") or os.getenv("API_TOKEN")
    if not api_token:
        print("❌ No BRIGHTDATA_API_KEY or API_TOKEN found")
        return False

    sse_url = f"https://mcp.brightdata.com/sse?token={api_token}"

    print("="*70)
    print("🧪 Testing BrightData MCP with SSE Transport")
    print("="*70)
    print(f"\n🔌 Connecting to: https://mcp.brightdata.com/sse?token=***\n")

    try:
        # Create SSE client connection
        async with sse_client(sse_url) as (read, write):
            print("✅ SSE client connected")

            async with ClientSession(read, write) as session:
                print("✅ Client session created")

                # Initialize the session
                print("\n🔧 Initializing session...")
                await session.initialize()
                print("✅ Session initialized")

                # Load tools
                print("\n📚 Loading tools from MCP server...")
                tools = await load_mcp_tools(session)

                print(f"\n✅ Successfully loaded {len(tools)} tools:\n")
                for i, tool in enumerate(tools, 1):
                    print(f"{i}. {tool.name}")
                    print(f"   Description: {tool.description}")
                    print()

                # Test invoking a tool (e.g., scraping)
                print("="*70)
                print("🧪 Testing tool invocation...")
                print("="*70)

                # Find a tool to test (look for browser/scrape tool)
                test_tool = None
                for tool in tools:
                    if "markdown" in tool.name.lower() or "scrape" in tool.name.lower():
                        test_tool = tool
                        break

                if test_tool:
                    print(f"\n🔍 Found test tool: {test_tool.name}")
                    print(f"   Testing with: https://example.com\n")

                    result = await test_tool.ainvoke({"url": "https://example.com"})

                    print("✅ Tool invocation successful!")
                    print(f"\n📄 Result preview (first 300 chars):")
                    print("-" * 70)
                    if isinstance(result, str):
                        print(result[:300])
                    elif isinstance(result, dict):
                        print(str(result)[:300])
                    else:
                        print(str(result)[:300])
                    print("-" * 70)
                else:
                    print("\n⚠️  No suitable test tool found")

                print("\n" + "="*70)
                print("✅ All tests passed!")
                print("="*70)
                return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    result = asyncio.run(test_mcp_connection())
    exit(0 if result else 1)
