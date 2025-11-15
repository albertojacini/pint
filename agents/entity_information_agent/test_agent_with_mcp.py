"""Complete example: LangGraph ReAct agent with BrightData MCP tools via SSE."""

import asyncio
import os
from dotenv import load_dotenv
from mcp import ClientSession
from mcp.client.sse import sse_client
from langchain_mcp_adapters.tools import load_mcp_tools
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

load_dotenv()


async def chat_with_agent():
    """
    Create a LangGraph ReAct agent with BrightData MCP tools.
    This matches the working example you provided.
    """

    # Get API token
    api_token = os.getenv("BRIGHTDATA_API_KEY") or os.getenv("API_TOKEN")
    if not api_token:
        print("❌ No BRIGHTDATA_API_KEY or API_TOKEN found")
        return

    sse_url = f"https://mcp.brightdata.com/sse?token={api_token}"

    print("="*70)
    print("🤖 Creating LangGraph Agent with BrightData MCP Tools")
    print("="*70)

    try:
        # 1) Connect to MCP server and discover tools
        async with sse_client(sse_url) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # 2) Load tools from BrightData MCP
                print("\n📚 Loading tools from BrightData MCP...")
                tools = await load_mcp_tools(session)

                print(f"✅ Loaded {len(tools)} tools from BrightData:")
                for tool in tools:
                    print(f"  - {tool.name}: {tool.description}")

                # 3) Create a LangGraph ReAct agent that can use those tools
                print("\n🤖 Creating ReAct agent with GPT-4o...")
                llm = ChatOpenAI(model="gpt-4o", temperature=0)
                agent = create_react_agent(llm, tools)

                # 4) Use the agent - it will decide when to call BrightData tools
                query = (
                    "Find information about Bologna, Italy from Wikipedia. "
                    "Show me the main content and any interesting facts."
                )

                print(f"\n🔍 Query: {query}\n")
                print("="*70)
                print("Agent thinking and using tools...")
                print("="*70)

                result = await agent.ainvoke({"messages": [query]})

                print("\n📄 Final Answer:")
                print("="*70)
                print(result["messages"][-1].content)
                print("="*70)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(chat_with_agent())
