"""Unified CLI for ownership research agents."""
import argparse
import asyncio
import json
from ownership_research.agents import get_agent, list_agents


async def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Research public assets using multiple agent implementations"
    )
    parser.add_argument("--description", "-d", required=True,
                       help="Public asset description")
    parser.add_argument("--agent", "-a",
                       choices=list_agents(),
                       default="lcdeep",
                       help="Agent implementation to use (default: lcdeep)")
    parser.add_argument("--debug", action="store_true",
                       help="Enable debug logging")

    args = parser.parse_args()

    print(f"\n🔍 Running {args.agent} agent...")
    print(f"Description: {args.description}\n")

    # Get and run agent
    try:
        agent_runner = get_agent(args.agent)
        result = await agent_runner.run(args.description, debug=args.debug)
    except ValueError as e:
        print(f"❌ Error: {e}")
        print(f"\nAvailable agents: {', '.join(list_agents())}")
        return

    # Display results
    if result and "error" not in result:
        print("\n✅ Research completed successfully!")
        print(f"Title: {result.get('title', 'N/A')}")
        print(f"Asset: {result.get('assetName', 'N/A')}")
        print(f"Ownership: {result.get('ownershipPercentage', 'N/A')}%")
        print(f"Confidence: {result.get('confidence', 'N/A')}")
        print(f"Sources: {len(result.get('sourceUrls', []))} URLs")

        if args.debug:
            print(f"\n{'='*80}")
            print("FULL JSON:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            print(f"{'='*80}\n")
    elif result:
        print(f"\n❌ Research Error: {result.get('error')}")
        print(f"Reason: {result.get('reason', 'Unknown')}")
        if result.get('suggestions'):
            print("Suggestions:")
            for suggestion in result['suggestions']:
                print(f"  - {suggestion}")
    else:
        print("\n❌ No result returned from agent")


if __name__ == "__main__":
    asyncio.run(main())
