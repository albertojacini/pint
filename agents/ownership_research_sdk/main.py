"""CLI entry point for Claude SDK ownership research agent."""

import argparse
import asyncio
import json
import sys
import os
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ownership_research_sdk.agent import run_ownership_research_sdk
from ownership_research_sdk.config import OUTPUT_DIR


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    import re
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '_', text)
    return text[:100]


def save_result(result: dict, description: str) -> Path:
    """
    Save result to output directory.

    Args:
        result: The research result dict
        description: The original description

    Returns:
        Path to saved file
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    slug = slugify(description)
    filename = f"{slug}_{timestamp}.json"
    filepath = OUTPUT_DIR / filename

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    return filepath


async def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Research public assets using Claude SDK (built-in tools only)"
    )
    parser.add_argument(
        "--description", "-d",
        required=True,
        help="Public asset description to research"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging"
    )
    args = parser.parse_args()

    print("\n🔍 Ownership Research Agent (Claude SDK)")
    print("="*80)
    print(f"Description: {args.description}")
    print(f"Debug mode: {args.debug}")
    print("="*80 + "\n")

    # Run the SDK agent
    result = await run_ownership_research_sdk(args.description, debug=args.debug)

    # Handle result
    if result:
        # Check if it's an error
        if "error" in result:
            print(f"\n❌ Research Error: {result['error']}")
            print(f"Reason: {result.get('reason', 'Unknown')}")
            if result.get('suggestions'):
                print(f"Suggestions:")
                for suggestion in result['suggestions']:
                    print(f"  - {suggestion}")
        else:
            print("\n✅ Research completed successfully!")
            print(f"\nTitle: {result.get('title', 'N/A')}")
            print(f"Asset: {result.get('assetName', 'N/A')}")
            print(f"Category: {result.get('assetCategory', 'N/A')}")
            print(f"Ownership: {result.get('ownershipPercentage', 'N/A')}%")
            print(f"Confidence: {result.get('confidence', 'N/A')}")
            print(f"Sources: {len(result.get('sourceUrls', []))} URLs")

        # Save to file
        filepath = save_result(result, args.description)
        print(f"\n💾 Result saved to: {filepath}")

        # Print full JSON in debug mode
        if args.debug:
            print(f"\n{'='*80}")
            print("FULL JSON OUTPUT:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            print(f"{'='*80}\n")
    else:
        print("\n❌ No result returned from agent")
        print("This may indicate an error during execution or response parsing")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
