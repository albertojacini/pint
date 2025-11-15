"""Minimal MCP test based on techwithtim's working example."""

import os
import asyncio
from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools

load_dotenv()

server_params = StdioServerParameters(
    command="npx",
    env={
        "API_TOKEN": os.getenv("BRIGHTDATA_API_KEY"),  # Using our key name
        "BROWSER_AUTH": os.getenv("BROWSER_AUTH", ""),
        "WEB_UNLOCKER_ZONE": os.getenv("WEB_UNLOCKER_ZONE", "mcp_unlocker"),
    },
    args=["@brightdata/mcp@1.5.0"],  # Try older version
)


async def test_mcp():
    print("🔌 Connecting to MCP server...")

    async with stdio_client(server_params) as (read, write):
        print("✅ Connected!")

        async with ClientSession(read, write) as session:
            print("📡 Initializing session...")
            await session.initialize()
            print("✅ Session initialized!")

            print("📚 Loading tools...")
            tools = await load_mcp_tools(session)
            print(f"✅ Loaded {len(tools)} tools:")

            for tool in tools:
                print(f"  - {tool.name}: {tool.description[:60]}...")

            return tools


if __name__ == "__main__":
    asyncio.run(test_mcp())
