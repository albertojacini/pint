"""CLI entry point for the provision generator agent."""

import argparse
import asyncio
import json
import os
from datetime import datetime
from pathlib import Path

from provision_generator.agent import create_provision_generator_agent
from provision_generator.config import OUTPUT_DIR


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    return text.lower().replace(" ", "_").replace("'", "")[:30]


async def run_agent(description: str, entity: str) -> dict:
    """
    Run the provision generator agent.

    Args:
        description: Short description of the provision to search for
        entity: Name of the political entity

    Returns:
        The generated provision or error object
    """
    print(f"\n{'='*60}")
    print(f"Provision Generator Agent")
    print(f"{'='*60}")
    print(f"Description: {description}")
    print(f"Entity: {entity}")
    print(f"{'='*60}\n")

    # Create the agent
    agent, mcp_client = await create_provision_generator_agent()

    # Prepare the user message
    user_message = f"""Find and document the following provision:

**Provision Description**: {description}
**Political Entity**: {entity}

Please follow your workflow:
1. Classify the provision type
2. Research general information using the general-researcher subagent
3. Research type-specific details using the type-researcher subagent
4. Validate and structure the output
5. Write the final JSON to the output directory

If you cannot find reliable information or the description doesn't describe a valid provision, return an error with suggestions."""

    # Run the agent (MCP client no longer needs context manager)
    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": user_message}]
    })

    # Extract the final message content
    final_message = result.get("messages", [])[-1] if result.get("messages") else None

    if final_message:
        print("\n" + "="*60)
        print("Agent Response:")
        print("="*60)
        content = final_message.content if hasattr(final_message, 'content') else str(final_message)
        print(content)

    return result


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate provision documentation using AI research"
    )
    parser.add_argument(
        "--description", "-d",
        required=True,
        help="Short description of the provision (e.g., 'Milan congestion charge')"
    )
    parser.add_argument(
        "--entity", "-e",
        required=True,
        help="Political entity name (e.g., 'Comune di Milano')"
    )

    args = parser.parse_args()

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Run the agent
    result = await run_agent(args.description, args.entity)

    print("\n" + "="*60)
    print("Done!")
    print(f"Check {OUTPUT_DIR} for output files.")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
