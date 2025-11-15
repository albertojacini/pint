"""Test the entity information agent with updated MCP integration."""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

# Test that MCP integration works
async def test_mcp_tools():
    """Test that we can load MCP tools."""
    from mcp_operations import initialize_mcp_session, close_mcp_session

    print("="*70)
    print("🧪 Testing MCP Tool Loading")
    print("="*70)

    tools = await initialize_mcp_session()

    if tools:
        print(f"\n✅ Successfully loaded {len(tools)} tools:")
        for tool in tools:
            print(f"  - {tool.name}")

        # Test scraping a simple page
        scrape_tool = None
        for tool in tools:
            if "markdown" in tool.name.lower():
                scrape_tool = tool
                break

        if scrape_tool:
            print(f"\n🔍 Testing {scrape_tool.name} on https://example.com...")
            result = await scrape_tool.ainvoke({"url": "https://example.com"})
            print(f"✅ Scraping successful! Got {len(str(result))} characters")
            print(f"\nPreview:\n{str(result)[:200]}...")

        await close_mcp_session()
        return True
    else:
        print("❌ Failed to load MCP tools")
        return False


# Test the full entity agent
async def test_entity_agent():
    """Test the entity information agent."""
    from main import EntityInformationAgent

    print("\n" + "="*70)
    print("🧪 Testing Entity Information Agent")
    print("="*70)

    # Create agent
    agent = EntityInformationAgent()

    # Test with a small Italian city to avoid rate limits
    print("\n🔍 Processing: Ferrara, Italy")
    result = await agent.process_entity(
        entity_name="Ferrara",
        entity_type="city",
        language="it"
    )

    if result.get("complete_entity"):
        entity = result["complete_entity"]
        print("\n✅ Entity processed successfully!")
        print(f"\n📊 Summary:")
        print(f"  Name: {entity.name}")
        print(f"  Type: {entity.type}")
        if entity.population:
            print(f"  Population: {entity.population:,}")
        if entity.description:
            print(f"  Description: {entity.description[:200]}...")
        if entity.political_landscape and entity.political_landscape.current_mayor:
            print(f"  Mayor: {entity.political_landscape.current_mayor.name}")

        return True
    else:
        print("\n⚠️ Entity processing had issues")
        if result.get("errors"):
            print(f"  Errors: {result['errors']}")
        return False


async def main():
    """Run all tests."""
    print("\n" + "="*70)
    print("🚀 Entity Information Agent - Test Suite")
    print("="*70)

    # Test 1: MCP tools
    print("\n📋 Test 1: MCP Tool Loading")
    mcp_ok = await test_mcp_tools()

    if not mcp_ok:
        print("\n❌ MCP tools test failed. Skipping entity agent test.")
        return

    # Test 2: Full entity agent
    print("\n📋 Test 2: Entity Agent")
    agent_ok = await test_entity_agent()

    # Summary
    print("\n" + "="*70)
    if mcp_ok and agent_ok:
        print("✅ All tests passed!")
    else:
        print("⚠️ Some tests failed")
    print("="*70)


if __name__ == "__main__":
    asyncio.run(main())
