"""Simple test for SSE-based MCP connection."""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment
load_dotenv()


async def test_brightdata_mcp():
    """Test BrightData MCP with SSE transport."""
    from mcp import ClientSession
    from mcp.client.sse import sse_client
    from langchain_mcp_adapters.tools import load_mcp_tools
    from langchain_openai import ChatOpenAI
    from langgraph.prebuilt import create_react_agent

    # Get API token
    api_token = os.getenv("BRIGHTDATA_API_KEY") or os.getenv("API_TOKEN")
    if not api_token:
        print("❌ No BRIGHTDATA_API_KEY or API_TOKEN found")
        return

    sse_url = f"https://mcp.brightdata.com/sse?token={api_token}"

    print("🔌 Connecting to BrightData MCP (SSE transport)...")
    print(f"   Endpoint: https://mcp.brightdata.com/sse?token=***")

    try:
        # Create SSE client connection
        async with sse_client(sse_url) as (read, write):
            print("   ✅ SSE client connected")

            async with ClientSession(read, write) as session:
                print("   ✅ Client session created")

                # Initialize the session
                print("\n🔧 Initializing session...")
                await session.initialize()
                print("   ✅ Session initialized")

                # Load tools using langchain adapter
                print("\n📚 Loading tools from MCP server...")
                tools = await load_mcp_tools(session)

                print(f"\n✅ Successfully loaded {len(tools)} tools:")
                for tool in tools:
                    print(f"  - {tool.name}: {tool.description}")

                # Create LangGraph ReAct agent with these tools
                print("\n🤖 Creating LangGraph ReAct agent...")
                llm = ChatOpenAI(model="gpt-4o", temperature=0)
                agent = create_react_agent(llm, tools)

                # Test with a simple query
                print("\n🔍 Testing agent with a query...")
                query = "Get the content from https://en.wikipedia.org/wiki/Bologna"

                result = await agent.ainvoke({"messages": [query]})

                print("\n📄 Agent response:")
                print("=" * 70)
                print(result["messages"][-1].content[:500])  # First 500 chars
                print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_brightdata_mcp())
